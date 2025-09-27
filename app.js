const WhatsAppServer = require('./src/server');

// Create and start the server
const server = new WhatsAppServer();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await server.stop();
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    await server.stop();
});

// Start the server
server.start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});