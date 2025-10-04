require('dotenv').config();

const config = {
    server: {
        port: parseInt(process.env.PORT) || 3000,
        host: process.env.HOST || '0.0.0.0',
        env: process.env.NODE_ENV || 'development'
    },
    api: {
        apiKey: process.env.API_KEY || null
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
    },
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024
    },
    whatsapp: {
        sessionName: process.env.WHATSAPP_SESSION_NAME || 'default-session',
        headless: process.env.WHATSAPP_HEADLESS === 'true',
        devtools: process.env.WHATSAPP_DEVTOOLS === 'true',
        messageDelay: parseInt(process.env.DEFAULT_MESSAGE_DELAY) || 1000,
        bulkMessageDelay: parseInt(process.env.BULK_MESSAGE_DELAY) || 2000,
        puppeteer: {
            headless: process.env.WHATSAPP_HEADLESS === 'true',
            ...(process.env.CHROME_EXECUTABLE_PATH && {
                executablePath: process.env.CHROME_EXECUTABLE_PATH
            }),
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
    }
};

module.exports = config;
