const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import configuration and services
const config = require('./config/config');
const WhatsAppService = require('./services/whatsappService');
const whatsappRoutes = require('./routes/whatsapp');

class WhatsAppServer {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIo(this.server, {
            cors: {
                origin: config.server.cors.origin,
                methods: config.server.cors.methods
            }
        });
        
        this.whatsappService = new WhatsAppService();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupSocketIO();
        this.setupWhatsAppEvents();
        this.setupErrorHandling();
        
        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
    }

    setupMiddleware() {
        // Security middleware
        this.app.use(helmet(config.security.helmet));
        
        // CORS
        this.app.use(cors(config.server.cors));
        
        // Rate limiting
        const limiter = rateLimit(config.api.rateLimit);
        this.app.use('/api/', limiter);
        
        // Logging
        this.app.use(morgan(config.logging.format));
        
        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        
        // Static files
        this.app.use(express.static(path.join(__dirname, '../public')));
    }

    setupRoutes() {
        // API routes
        this.app.use('/api/whatsapp', whatsappRoutes(this.whatsappService));
        
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                success: true,
                message: 'Server is healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            });
        });

        // API documentation
        this.app.get('/api', (req, res) => {
            res.json({
                success: true,
                message: 'WhatsApp API Server',
                version: config.api.version,
                endpoints: {
                    'POST /api/whatsapp/send': 'Send a single message',
                    'POST /api/whatsapp/send-media': 'Send a message with media',
                    'POST /api/whatsapp/send-bulk': 'Send bulk messages',
                    'GET /api/whatsapp/status': 'Get WhatsApp client status',
                    'GET /api/whatsapp/qr': 'Get QR code for authentication',
                    'GET /api/whatsapp/chats': 'Get all chats',
                    'GET /api/whatsapp/contacts': 'Get all contacts',
                    'POST /api/whatsapp/restart': 'Restart WhatsApp client',
                    'GET /health': 'Health check',
                    'GET /': 'Web interface'
                }
            });
        });
        
        // Serve the main web interface
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../views/index.html'));
        });

        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({
                success: false,
                error: 'Endpoint not found',
                message: `The endpoint ${req.method} ${req.originalUrl} was not found`
            });
        });
    }

    setupSocketIO() {
        this.io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);
            
            // Send current status to new client
            socket.emit('status', this.whatsappService.getStatus());
            
            // Send QR code if available
            const qrCode = this.whatsappService.getQRCode();
            if (qrCode) {
                socket.emit('qr', qrCode);
            }

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });

            socket.on('restart-client', async () => {
                try {
                    await this.whatsappService.restart();
                    socket.emit('message', { type: 'success', text: 'Client restarted successfully' });
                } catch (error) {
                    socket.emit('message', { type: 'error', text: 'Failed to restart client: ' + error.message });
                }
            });
        });
    }

    setupWhatsAppEvents() {
        this.whatsappService.on('qr', (qrCode) => {
            console.log('QR code generated');
            this.io.emit('qr', qrCode);
        });

        this.whatsappService.on('ready', (clientInfo) => {
            console.log('WhatsApp client ready');
            this.io.emit('ready', clientInfo);
            this.io.emit('status', this.whatsappService.getStatus());
        });

        this.whatsappService.on('authenticated', () => {
            console.log('WhatsApp client authenticated');
            this.io.emit('authenticated');
            this.io.emit('status', this.whatsappService.getStatus());
        });

        this.whatsappService.on('auth_failure', (message) => {
            console.log('Authentication failed:', message);
            this.io.emit('auth_failure', message);
            this.io.emit('status', this.whatsappService.getStatus());
        });

        this.whatsappService.on('disconnected', (reason) => {
            console.log('WhatsApp client disconnected:', reason);
            this.io.emit('disconnected', reason);
            this.io.emit('status', this.whatsappService.getStatus());
        });

        this.whatsappService.on('message', (message) => {
            this.io.emit('message_received', {
                from: message.from,
                body: message.body,
                timestamp: message.timestamp,
                type: message.type
            });
        });

        this.whatsappService.on('error', (error) => {
            console.error('WhatsApp service error:', error);
            this.io.emit('error', error.message);
        });
    }

    setupErrorHandling() {
        // Global error handler
        this.app.use((error, req, res, next) => {
            console.error('Unhandled error:', error);
            
            // Multer errors
            if (error instanceof multer.MulterError) {
                if (error.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        success: false,
                        error: 'File too large',
                        message: `File size exceeds the maximum limit of ${config.upload.maxFileSize / 1024 / 1024}MB`
                    });
                }
            }

            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
            });
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            process.exit(1);
        });
    }

    async start() {
        try {
            // Initialize WhatsApp service
            await this.whatsappService.initialize();
            
            // Start server
            this.server.listen(config.server.port, config.server.host, () => {
                console.log(`
🚀 WhatsApp API Server is running!

📱 Server: http://${config.server.host}:${config.server.port}
🌐 Web Interface: http://${config.server.host}:${config.server.port}
📋 API Documentation: http://${config.server.host}:${config.server.port}/api
💚 Health Check: http://${config.server.host}:${config.server.port}/health

📞 API Endpoints:
   POST /api/whatsapp/send - Send single message
   POST /api/whatsapp/send-bulk - Send bulk messages  
   GET  /api/whatsapp/status - Get client status
   GET  /api/whatsapp/qr - Get QR code

Environment: ${process.env.NODE_ENV || 'development'}
Rate Limit: ${config.api.rateLimit.max} requests per ${config.api.rateLimit.windowMs / 1000}s
                `);
            });
            
        } catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    }

    async stop() {
        console.log('Shutting down server...');
        
        // Close WhatsApp client
        if (this.whatsappService) {
            await this.whatsappService.destroy();
        }
        
        // Close server
        this.server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
    }
}

module.exports = WhatsAppServer;