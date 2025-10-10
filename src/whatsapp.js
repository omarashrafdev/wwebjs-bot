const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const config = require('./config/config');

class WhatsAppService {
    constructor() {
        this.client = null;
        this.isReady = false;
        this.qrCode = null;
        this.isInitializing = false;
    }

    async initialize() {
        if (this.isInitializing) {
            console.log('WhatsApp client is already initializing, waiting...');
            return;
        }
        
        console.log('Starting WhatsApp client initialization...');
        this.isInitializing = true;
        this.isReady = false;
        this.qrCode = null;

        try {
            // Ensure any existing client is properly destroyed first
            if (this.client) {
                console.log('Destroying existing client before reinitializing...');
                await this.destroy();
            }

            this.client = new Client({
                authStrategy: new LocalAuth({ clientId: config.whatsapp.sessionName }),
                puppeteer: config.whatsapp.puppeteer
            });

            this.setupEventHandlers();
            await this.client.initialize();
            console.log('WhatsApp client initialization started successfully');
        } catch (error) {
            console.error('Failed to initialize WhatsApp client:', error);
            this.isInitializing = false;
            this.isReady = false;
            this.qrCode = null;
            throw error;
        }
    }

    setupEventHandlers() {
        this.client.on('ready', () => {
            console.log('WhatsApp client is ready!');
            this.isReady = true;
            this.qrCode = null;
            this.isInitializing = false;
        });

        this.client.on('qr', async (qr) => {
            console.log('QR Code received, generating data URL...');
            try {
                this.qrCode = await qrcode.toDataURL(qr);
                console.log('QR Code successfully generated and stored, length:', this.qrCode ? this.qrCode.length : 0);
            } catch (error) {
                console.error('Failed to generate QR code:', error);
                this.qrCode = null;
            }
        });

        this.client.on('authenticated', () => {
            console.log('WhatsApp client authenticated');
            this.qrCode = null; // Clear QR code after authentication
        });

        this.client.on('auth_failure', (msg) => {
            console.error('Authentication failure:', msg);
            this.isReady = false;
            this.isInitializing = false;
            this.qrCode = null;
        });

        this.client.on('disconnected', (reason) => {
            console.log('WhatsApp client disconnected:', reason);
            this.isReady = false;
            this.qrCode = null;
            // Don't reset isInitializing here as it might be part of a restart process
        });
    }

    getStatus() {
        return {
            ready: this.isReady,
            hasQR: !!this.qrCode,
            initializing: this.isInitializing,
            qrCodeLength: this.qrCode ? this.qrCode.length : 0
        };
    }

    updateStatus(isReady) {
        this.isReady = isReady;
    }

    getQRCode() {
        return this.qrCode;
    }

    async sendMessage(to, message) {
        if (!this.isReady) {
            throw new Error('WhatsApp client is not ready');
        }

        try {
            // Format phone number
            const chatId = this.formatPhoneNumber(to);
            const chat = await this.client.getChatById(chatId);
            const result = await chat.sendMessage(message);
            return { success: true, messageId: result.id._serialized };
        } catch (error) {
            console.error('Failed to send message:', error);
            throw new Error(`Failed to send message: ${error.message}`);
        }
    }

    async sendBulkMessages(recipients, message) {
        if (!this.isReady) {
            throw new Error('WhatsApp client is not ready');
        }

        const results = [];
        const delay = config.whatsapp.bulkMessageDelay;

        for (const recipient of recipients) {
            try {
                await new Promise(resolve => setTimeout(resolve, delay));
                const result = await this.sendMessage(recipient, message);
                results.push({ recipient, success: true, messageId: result.messageId });
            } catch (error) {
                results.push({ recipient, success: false, error: error.message });
            }
        }

        return results;
    }

    async sendMediaMessage(to, media, caption = '') {
        if (!this.isReady) {
            throw new Error('WhatsApp client is not ready');
        }

        try {
            const chatId = this.formatPhoneNumber(to);
            const chat = await this.client.getChatById(chatId);
            const result = await chat.sendMessage(media, { caption });
            return { success: true, messageId: result.id._serialized };
        } catch (error) {
            console.error('Failed to send media message:', error);
            throw new Error(`Failed to send media message: ${error.message}`);
        }
    }

    formatPhoneNumber(phoneNumber) {
        // Remove all non-digit characters
        let cleaned = phoneNumber.replace(/\D/g, '');
        
        // Add country code if not present
        if (!cleaned.startsWith('2') && cleaned.length === 10) {
            cleaned = '20' + cleaned;
        }
        
        return cleaned + '@c.us';
    }

    async getChats() {
        if (!this.isReady) {
            throw new Error('WhatsApp client is not ready');
        }

        try {
            const chats = await this.client.getChats();
            return chats.map(chat => ({
                id: chat.id._serialized,
                name: chat.name,
                isGroup: chat.isGroup,
                unreadCount: chat.unreadCount
            }));
        } catch (error) {
            console.error('Failed to get chats:', error);
            throw new Error(`Failed to get chats: ${error.message}`);
        }
    }

    async destroy() {
        console.log('Destroying WhatsApp client...');
        
        // Reset all state first
        this.isReady = false;
        this.qrCode = null;
        this.isInitializing = false;
        
        if (this.client) {
            try {
                // Remove all event listeners to prevent memory leaks
                this.client.removeAllListeners();
                
                // Destroy the client
                await this.client.destroy();
                console.log('WhatsApp client destroyed successfully');
            } catch (error) {
                console.error('Error destroying WhatsApp client:', error);
            } finally {
                this.client = null;
            }
        }
        
        console.log('WhatsApp client state reset');
    }

    async restart() {
        console.log('Restarting WhatsApp client...');
        
        try {
            // First destroy the existing client
            await this.destroy();
            
            // Wait a moment to ensure cleanup is complete
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Then initialize a new client
            await this.initialize();
            
            console.log('WhatsApp client restart completed');
        } catch (error) {
            console.error('Failed to restart WhatsApp client:', error);
            throw error;
        }
    }
}

module.exports = WhatsAppService;