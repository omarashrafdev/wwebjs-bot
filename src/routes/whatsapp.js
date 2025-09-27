const express = require('express');
const multer = require('multer');
const path = require('path');
const { messageValidation, bulkMessageValidation, handleValidationErrors } = require('../middleware/validation');
const { apiKeyAuth } = require('../middleware/auth');
const config = require('../config/config');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: config.upload.maxFileSize
    },
    fileFilter: (req, file, cb) => {
        if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('File type not allowed'), false);
        }
    }
});

// Initialize routes with WhatsApp service
const initializeRoutes = (whatsappService) => {
    
    // Send single message
    router.post('/send', apiKeyAuth, messageValidation, handleValidationErrors, async (req, res) => {
        try {
            const { number, message, options = {} } = req.body;
            
            const result = await whatsappService.sendMessage(number, message, options);
            
            res.json({
                success: true,
                data: result,
                message: 'Message sent successfully'
            });
        } catch (error) {
            console.error('Error sending message:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to send message',
                message: error.message
            });
        }
    });

    // Send message with media
    router.post('/send-media', apiKeyAuth, upload.single('media'), async (req, res) => {
        try {
            const { number, message } = req.body;
            
            if (!number) {
                return res.status(400).json({
                    success: false,
                    error: 'Phone number is required'
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'Media file is required'
                });
            }

            const options = {
                media: req.file.path
            };

            const result = await whatsappService.sendMessage(number, message || '', options);
            
            res.json({
                success: true,
                data: result,
                message: 'Media message sent successfully'
            });
        } catch (error) {
            console.error('Error sending media message:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to send media message',
                message: error.message
            });
        }
    });

    // Send bulk messages
    router.post('/send-bulk', apiKeyAuth, bulkMessageValidation, handleValidationErrors, async (req, res) => {
        try {
            const { contacts, message, options = {} } = req.body;
            
            // Limit bulk messages
            if (contacts.length > config.whatsapp.maxBulkMessages) {
                return res.status(400).json({
                    success: false,
                    error: `Bulk message limit exceeded. Maximum ${config.whatsapp.maxBulkMessages} contacts allowed`
                });
            }

            const results = await whatsappService.sendBulkMessages(contacts, message, options);
            
            const successCount = results.filter(r => r.status === 'success').length;
            const failedCount = results.filter(r => r.status === 'failed').length;

            res.json({
                success: true,
                data: {
                    results: results,
                    summary: {
                        total: results.length,
                        success: successCount,
                        failed: failedCount
                    }
                },
                message: `Bulk messages completed: ${successCount} successful, ${failedCount} failed`
            });
        } catch (error) {
            console.error('Error sending bulk messages:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to send bulk messages',
                message: error.message
            });
        }
    });

    // Get WhatsApp status
    router.get('/status', (req, res) => {
        try {
            const status = whatsappService.getStatus();
            res.json({
                success: true,
                data: status,
                message: 'Status retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting status:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get status',
                message: error.message
            });
        }
    });

    // Get QR code
    router.get('/qr', (req, res) => {
        try {
            const qrCode = whatsappService.getQRCode();
            
            if (!qrCode) {
                return res.status(404).json({
                    success: false,
                    error: 'QR code not available',
                    message: 'QR code is not available. Client might be already authenticated or not initialized.'
                });
            }

            res.json({
                success: true,
                data: { qrCode },
                message: 'QR code retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting QR code:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get QR code',
                message: error.message
            });
        }
    });

    // Get chats
    router.get('/chats', apiKeyAuth, async (req, res) => {
        try {
            const chats = await whatsappService.getChats();
            res.json({
                success: true,
                data: chats,
                message: 'Chats retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting chats:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get chats',
                message: error.message
            });
        }
    });

    // Get contacts
    router.get('/contacts', apiKeyAuth, async (req, res) => {
        try {
            const contacts = await whatsappService.getContacts();
            res.json({
                success: true,
                data: contacts,
                message: 'Contacts retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting contacts:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get contacts',
                message: error.message
            });
        }
    });

    // Restart WhatsApp client
    router.post('/restart', apiKeyAuth, async (req, res) => {
        try {
            await whatsappService.restart();
            res.json({
                success: true,
                message: 'WhatsApp client restarted successfully'
            });
        } catch (error) {
            console.error('Error restarting client:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to restart client',
                message: error.message
            });
        }
    });

    return router;
};

module.exports = initializeRoutes;