require('dotenv').config();

const config = {
    // Server Configuration
    server: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || 'localhost',
        cors: {
            origin: process.env.CORS_ORIGIN || '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
        }
    },

    // API Configuration
    api: {
        version: 'v1',
        rateLimit: {
            windowMs: process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000, // 15 minutes
            max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
            message: 'Too many requests from this IP, please try again later.'
        },
        apiKey: process.env.API_KEY || null // Optional API key for authentication
    },

    // WhatsApp Configuration
    whatsapp: {
        sessionName: process.env.WHATSAPP_SESSION || 'default',
        puppeteer: {
            headless: process.env.PUPPETEER_HEADLESS !== 'false',
            executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
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
        messageDelay: parseInt(process.env.MESSAGE_DELAY) || 2000, // Delay between bulk messages
        maxBulkMessages: parseInt(process.env.MAX_BULK_MESSAGES) || 50 // Max messages in bulk operation
    },

    // Logging Configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'combined' // 'combined', 'common', 'dev', 'short', 'tiny'
    },

    // File Upload Configuration
    upload: {
        maxFileSize: process.env.MAX_FILE_SIZE || 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'video/mp4',
            'video/avi',
            'video/mov',
            'audio/mp3',
            'audio/wav',
            'audio/ogg',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
    },

    // Security Configuration
    security: {
        helmet: {
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
                    scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'", "ws:", "wss:"]
                }
            }
        }
    }
};

module.exports = config;