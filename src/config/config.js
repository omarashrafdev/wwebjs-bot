require('dotenv').config();

const config = {
    server: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || 'localhost',
        env: process.env.NODE_ENV || 'development',
        cors: {
            origin: process.env.CORS_ORIGIN || '*',
            credentials: process.env.CORS_CREDENTIALS === 'true',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
        }
    },
    
    api: {
        apiKey: process.env.API_KEY,
        rateLimit: {
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
            max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
            message: 'Too many requests from this IP, please try again later.'
        }
    },
    
    whatsapp: {
        sessionName: process.env.WHATSAPP_SESSION_NAME || 'default-session',
        headless: process.env.WHATSAPP_HEADLESS === 'true',
        devtools: process.env.WHATSAPP_DEVTOOLS === 'true',
        messageDelay: parseInt(process.env.DEFAULT_MESSAGE_DELAY) || 1000,
        bulkMessageDelay: parseInt(process.env.BULK_MESSAGE_DELAY) || 2000,
        maxBulkRecipients: parseInt(process.env.MAX_BULK_RECIPIENTS) || 50,
        puppeteer: {
            headless: process.env.PUPPETEER_HEADLESS !== 'false',
            executablePath: process.env.CHROME_PATH || null,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        }
    },
    
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
        uploadDir: process.env.UPLOAD_DIR || 'uploads',
        allowedMimeTypes: process.env.ALLOWED_FILE_TYPES ? 
            process.env.ALLOWED_FILE_TYPES.split(',') : 
            ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain',
             'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    },
    
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'combined',
        file: process.env.LOG_FILE || 'logs/app.log',
        maxSize: process.env.LOG_MAX_SIZE || '10m',
        maxFiles: process.env.LOG_MAX_FILES || 5
    },
    
    security: {
        helmet: {
            contentSecurityPolicy: process.env.CSP_ENABLED === 'true' ? {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "cdn.socket.io"],
                    styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
                    imgSrc: ["'self'", "data:", "blob:"],
                    connectSrc: ["'self'", "ws:", "wss:"]
                }
            } : false,
            hsts: {
                maxAge: parseInt(process.env.HSTS_MAX_AGE) || 31536000
            }
        },
        session: {
            secret: process.env.SESSION_SECRET || 'default-secret',
            maxAge: parseInt(process.env.SESSION_MAX_AGE) || 86400000
        }
    },

    // Appwrite Configuration
    appwrite: {
        endpoint: process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
        projectId: process.env.APPWRITE_PROJECT_ID,
        apiKey: process.env.APPWRITE_API_KEY,
        databaseId: process.env.APPWRITE_DATABASE_ID,
        collections: {
            sessions: process.env.APPWRITE_SESSIONS_COLLECTION_ID,
            messages: process.env.APPWRITE_MESSAGES_COLLECTION_ID,
            contacts: process.env.APPWRITE_CONTACTS_COLLECTION_ID
        },
        bucketId: process.env.APPWRITE_BUCKET_ID
    },

    // Feature flags
    features: {
        mediaMessages: process.env.FEATURE_MEDIA_MESSAGES === 'true',
        bulkMessaging: process.env.FEATURE_BULK_MESSAGING === 'true',
        studentManagement: process.env.FEATURE_STUDENT_MANAGEMENT === 'true',
        messageTemplates: process.env.FEATURE_MESSAGE_TEMPLATES === 'true',
        analytics: process.env.FEATURE_ANALYTICS === 'true',
        chatbot: process.env.FEATURE_CHATBOT === 'true'
    }
};

module.exports = config;