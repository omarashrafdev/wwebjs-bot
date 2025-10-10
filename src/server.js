const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const { MessageMedia } = require('whatsapp-web.js');
const WhatsAppService = require('./whatsapp');
const config = require('./config/config');
const e = require('express');

class WhatsAppServer {
    constructor() {
        this.app = express();
        this.whatsapp = new WhatsAppService();
        this.server = null;
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        // CORS
        this.app.use(cors({ origin: '*' }));

        // JSON parser
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Rate limiting
        const limiter = rateLimit({
            windowMs: config.rateLimit.windowMs,
            max: config.rateLimit.maxRequests,
            message: 'Too many requests, please try again later.'
        });
        this.app.use('/api/', limiter);

        // API Key middleware (optional)
        // if (config.api.apiKey) {
        //     this.app.use('/api/', (req, res, next) => {
        //         const apiKey = req.headers['x-api-key'] || req.query.apikey;
        //         if (apiKey !== config.api.apiKey) {
        //             return res.status(401).json({ error: 'Invalid API key' });
        //         }
        //         next();
        //     });
        // }

        // File upload
        this.upload = multer({
            limits: { fileSize: config.upload.maxFileSize },
            storage: multer.memoryStorage()
        });
    }

    setupRoutes() {
        // Health check
        this.app.get('/', (req, res) => {
            res.json({ 
                status: 'WhatsApp API Server is running',
                version: '1.0.0',
                timestamp: new Date().toISOString()
            });
        });

        // API documentation
        this.app.get('/api/docs', (req, res) => {
            res.json({
                endpoints: [
                    { method: 'GET', path: '/', description: 'Health check' },
                    { method: 'GET', path: '/api/status', description: 'Get WhatsApp client status' },
                    { method: 'GET', path: '/api/qr', description: 'Get WhatsApp QR code (base64)' },
                    { method: 'GET', path: '/api/qr/image', description: 'Get WhatsApp QR code as image' },
                    { method: 'POST', path: '/api/send', description: 'Send a single message', body: { to: 'string', message: 'string' } },
                    { method: 'POST', path: '/api/send/bulk', description: 'Send bulk messages', body: { recipients: 'array', message: 'string' } },
                    { method: 'POST', path: '/api/send/media', description: 'Send media message', body: { to: 'string', caption: 'string', file: 'file' } },
                    { method: 'GET', path: '/api/chats', description: 'Get WhatsApp chats' },
                    { method: 'POST', path: '/api/restart', description: 'Restart WhatsApp client' }
                ]
            });
        });


        // WhatsApp status
        this.app.get('/api/status', (req, res) => {
            try {
                const status = this.whatsapp.getStatus();
                res.json(status);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Get QR code
        this.app.get('/api/qr', (req, res) => {
            try {
                const qrCode = this.whatsapp.getQRCode();
                console.log('QR code request - Available:', !!qrCode);
                if (!qrCode) {
                    return res.status(404).json({ 
                        error: 'QR code not available',
                        status: this.whatsapp.getStatus()
                    });
                }
                
                // Return as base64 data URL
                res.json({ qrCode });
            } catch (error) {
                console.error('Error getting QR code:', error);
                res.status(500).json({ error: error.message });
            }
        });

        // Get QR code as image
        this.app.get('/api/qr/image', (req, res) => {
            try {
                const qrCode = this.whatsapp.getQRCode();
                console.log('QR image request - Available:', !!qrCode);
                if (!qrCode) {
                    return res.status(404).json({ 
                        error: 'QR code not available',
                        status: this.whatsapp.getStatus()
                    });
                }
                
                // Extract base64 data and send as image
                const base64Data = qrCode.replace(/^data:image\/png;base64,/, '');
                const buffer = Buffer.from(base64Data, 'base64');
                
                res.setHeader('Content-Type', 'image/png');
                res.send(buffer);
            } catch (error) {
                console.error('Error getting QR image:', error);
                res.status(500).json({ error: error.message });
            }
        });

        // Send single message
        this.app.post('/api/whatsapp/send', async (req, res) => {
            try {
                const { to, message } = req.body;
                
                if (!to || !message) {
                    return res.status(400).json({ error: 'Missing required fields: to, message' });
                }

                const result = await this.whatsapp.sendMessage(to, message);
                res.json(result);
            } catch (error) {
                if (error.message.toLowerCase().includes('session')) {
                    this.whatsapp.updateStatus(false);
                }
                res.status(500).json({ error: error.message });
            }
        });

        // Send bulk messages
        this.app.post('/api/whatsapp/send/bulk', async (req, res) => {
            try {
                const { recipients, message } = req.body;
                
                if (!recipients || !Array.isArray(recipients) || !message) {
                    return res.status(400).json({ error: 'Missing required fields: recipients (array), message' });
                }

                if (recipients.length > 50) {
                    return res.status(400).json({ error: 'Maximum 50 recipients allowed' });
                }

                const results = await this.whatsapp.sendBulkMessages(recipients, message);
                res.json({ results });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Send media message
        this.app.post('/api/whatsapp/send/media', this.upload.single('file'), async (req, res) => {
            try {
                const { to, caption } = req.body;
                const file = req.file;
                
                if (!to || !file) {
                    return res.status(400).json({ error: 'Missing required fields: to, file' });
                }

                // Create MessageMedia from uploaded file
                const media = new MessageMedia(file.mimetype, file.buffer.toString('base64'), file.originalname);
                
                const result = await this.whatsapp.sendMediaMessage(to, media, caption);
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Get chats
        this.app.get('/api/whatsapp/chats', async (req, res) => {
            try {
                const chats = await this.whatsapp.getChats();
                res.json({ chats });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Restart WhatsApp client
        this.app.post('/api/whatsapp/restart', async (req, res) => {
            try {
                console.log('API restart request received');
                await this.whatsapp.restart();
                
                const status = this.whatsapp.getStatus();
                res.json({ 
                    message: 'WhatsApp client restarted successfully',
                    status: status
                });
            } catch (error) {
                console.error('Failed to restart WhatsApp client:', error);
                res.status(500).json({ error: error.message });
            }
        });

        // Error handling middleware
        this.app.use((error, req, res, next) => {
            console.error('Unhandled error:', error);
            res.status(500).json({ error: 'Internal server error' });
        });

        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({ error: 'Endpoint not found' });
        });
    }

    async start() {
        try {
            // Initialize WhatsApp client
            console.log('Initializing WhatsApp client...');
            await this.whatsapp.initialize();

            // Start server
            this.server = this.app.listen(config.server.port, config.server.host, () => {
                console.log(`✅ WhatsApp API Server running on http://${config.server.host}:${config.server.port}`);
                console.log(`📱 Environment: ${config.server.env}`);
                
                if (!this.whatsapp.getStatus().ready) {
                    console.log('📲 Waiting for WhatsApp authentication...');
                    console.log(`🔗 Check QR code at: http://${config.server.host}:${config.server.port}/api/qr/image`);
                }
            });
        } catch (error) {
            console.error('Failed to start server:', error);
            throw error;
        }
    }

    async stop() {
        console.log('Shutting down server...');
        
        if (this.whatsapp) {
            await this.whatsapp.destroy();
        }

        if (this.server) {
            this.server.close();
        }
        
        console.log('Server stopped');
    }
}

module.exports = WhatsAppServer;
