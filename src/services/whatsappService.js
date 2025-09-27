const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const EventEmitter = require('events');

class WhatsAppService extends EventEmitter {
    constructor() {
        super();
        this.client = null;
        this.qrCode = null;
        this.isReady = false;
        this.isConnected = false;
        this.clientInfo = null;
        this.initializeClient();
    }

    initializeClient() {
        this.client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: {
                executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            },
            webVersionCache: {
                type: 'remote',
                remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
            }
        });

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.client.on('qr', async (qr) => {
            console.log('QR Code received');
            try {
                this.qrCode = await QRCode.toDataURL(qr);
                this.emit('qr', this.qrCode);
            } catch (error) {
                console.error('Error generating QR code:', error);
                this.emit('error', error);
            }
        });

        this.client.on('ready', () => {
            console.log('WhatsApp client is ready!');
            this.isReady = true;
            this.isConnected = true;
            this.qrCode = null;
            this.clientInfo = {
                user: this.client.info,
                ready: true,
                timestamp: new Date()
            };
            this.emit('ready', this.clientInfo);
        });

        this.client.on('authenticated', () => {
            console.log('WhatsApp client authenticated');
            this.emit('authenticated');
        });

        this.client.on('auth_failure', (message) => {
            console.error('Authentication failed:', message);
            this.isReady = false;
            this.isConnected = false;
            this.emit('auth_failure', message);
        });

        this.client.on('disconnected', (reason) => {
            console.log('WhatsApp client disconnected:', reason);
            this.isReady = false;
            this.isConnected = false;
            this.clientInfo = null;
            this.emit('disconnected', reason);
        });

        this.client.on('message', (message) => {
            console.log(`Message from ${message.from}: ${message.body}`);
            this.emit('message', message);
        });

        this.client.on('message_create', (message) => {
            this.emit('message_create', message);
        });
    }

    async initialize() {
        try {
            console.log('Initializing WhatsApp client...');
            await this.client.initialize();
        } catch (error) {
            console.error('Failed to initialize WhatsApp client:', error);
            this.emit('error', error);
            throw error;
        }
    }

    async sendMessage(number, message, options = {}) {
        if (!this.isReady) {
            throw new Error('WhatsApp client is not ready');
        }

        try {
            // Format phone number (ensure it has country code)
            const formattedNumber = this.formatPhoneNumber(number);
            const chatId = `${formattedNumber}@c.us`;

            // Check if number is valid
            const numberId = await this.client.getNumberId(formattedNumber);
            if (!numberId) {
                throw new Error('Invalid phone number or number not registered on WhatsApp');
            }

            let sentMessage;
            
            if (options.media) {
                // Send media message
                const media = MessageMedia.fromFilePath(options.media);
                sentMessage = await this.client.sendMessage(numberId._serialized, media, {
                    caption: message || ''
                });
            } else {
                // Send text message
                sentMessage = await this.client.sendMessage(numberId._serialized, message);
            }

            return {
                success: true,
                messageId: sentMessage.id._serialized,
                timestamp: sentMessage.timestamp,
                to: formattedNumber,
                body: message
            };
        } catch (error) {
            console.error('Failed to send message:', error);
            throw error;
        }
    }

    async sendBulkMessages(contacts, message, options = {}) {
        if (!this.isReady) {
            throw new Error('WhatsApp client is not ready');
        }

        const results = [];
        const delay = options.delay || 2000; // Default 2 second delay between messages

        for (const contact of contacts) {
            try {
                const result = await this.sendMessage(contact.number, 
                    this.personalizeMessage(message, contact), options);
                results.push({
                    contact: contact,
                    result: result,
                    status: 'success'
                });
            } catch (error) {
                results.push({
                    contact: contact,
                    result: null,
                    status: 'failed',
                    error: error.message
                });
            }

            // Add delay between messages to avoid spam detection
            if (delay > 0) {
                await this.sleep(delay);
            }
        }

        return results;
    }

    personalizeMessage(template, contact) {
        let personalizedMessage = template;
        
        // Replace placeholders with contact data
        personalizedMessage = personalizedMessage.replace(/\{name\}/g, contact.name || 'Student');
        personalizedMessage = personalizedMessage.replace(/\{firstName\}/g, contact.firstName || contact.name || 'Student');
        personalizedMessage = personalizedMessage.replace(/\{lastName\}/g, contact.lastName || '');
        personalizedMessage = personalizedMessage.replace(/\{studentId\}/g, contact.studentId || '');
        personalizedMessage = personalizedMessage.replace(/\{class\}/g, contact.class || '');
        personalizedMessage = personalizedMessage.replace(/\{grade\}/g, contact.grade || '');

        return personalizedMessage;
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
                unreadCount: chat.unreadCount,
                lastMessage: chat.lastMessage
            }));
        } catch (error) {
            console.error('Failed to get chats:', error);
            throw error;
        }
    }

    async getContacts() {
        if (!this.isReady) {
            throw new Error('WhatsApp client is not ready');
        }

        try {
            const contacts = await this.client.getContacts();
            return contacts.map(contact => ({
                id: contact.id._serialized,
                name: contact.name,
                pushname: contact.pushname,
                number: contact.number,
                isMyContact: contact.isMyContact
            }));
        } catch (error) {
            console.error('Failed to get contacts:', error);
            throw error;
        }
    }

    formatPhoneNumber(number) {
        // Remove all non-digit characters
        const cleaned = number.replace(/\D/g, '');
        
        // If number doesn't start with country code, assume it's Egyptian (+20)
        if (cleaned.length === 10 && !cleaned.startsWith('20')) {
            return '20' + cleaned;
        }
        
        // If number starts with 0, remove it and add country code
        if (cleaned.startsWith('0') && cleaned.length === 11) {
            return '20' + cleaned.substring(1);
        }
        
        return cleaned;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getStatus() {
        return {
            isReady: this.isReady,
            isConnected: this.isConnected,
            hasQR: !!this.qrCode,
            clientInfo: this.clientInfo
        };
    }

    getQRCode() {
        return this.qrCode;
    }

    async destroy() {
        if (this.client) {
            await this.client.destroy();
            this.client = null;
            this.isReady = false;
            this.isConnected = false;
            this.qrCode = null;
            this.clientInfo = null;
        }
    }

    async restart() {
        await this.destroy();
        this.initializeClient();
        await this.initialize();
    }
}

module.exports = WhatsAppService;