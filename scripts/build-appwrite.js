#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Building WhatsApp API Server for Appwrite Functions...');

// Create functions directory structure
const functionsDir = path.join(__dirname, '../functions');
const whatsappApiDir = path.join(functionsDir, 'whatsapp-api');
const srcDir = path.join(whatsappApiDir, 'src');

// Create directories
if (!fs.existsSync(functionsDir)) {
    fs.mkdirSync(functionsDir, { recursive: true });
}
if (!fs.existsSync(whatsappApiDir)) {
    fs.mkdirSync(whatsappApiDir, { recursive: true });
}
if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
}

console.log('📁 Created directory structure');

// Copy source files to functions directory
const filesToCopy = [
    'src',
    'public',
    'views',
    'package.json',
    '.env.appwrite'
];

filesToCopy.forEach(item => {
    const srcPath = path.join(__dirname, '..', item);
    const destPath = path.join(whatsappApiDir, item);
    
    if (fs.existsSync(srcPath)) {
        copyRecursiveSync(srcPath, destPath);
        console.log(`✅ Copied ${item}`);
    }
});

// Create Appwrite Function entry point
const mainJs = `
const { Client, Databases, Storage, Functions } = require('node-appwrite');
const WhatsAppServer = require('./src/server');

// Initialize Appwrite Client
const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

// Main Appwrite Function Handler
module.exports = async (req, res) => {
    try {
        // Initialize WhatsApp Server with Appwrite integration
        const server = new WhatsAppServer();
        
        // Add Appwrite client to server context
        server.appwrite = {
            client,
            databases,
            storage,
            databaseId: process.env.APPWRITE_DATABASE_ID,
            bucketsId: process.env.APPWRITE_BUCKET_ID
        };
        
        // Start the server
        await server.start();
        
        return res.json({
            success: true,
            message: 'WhatsApp API Server started successfully',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Function execution failed:', error);
        return res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};
`;

fs.writeFileSync(path.join(whatsappApiDir, 'src', 'main.js'), mainJs);
console.log('✅ Created main.js entry point');

// Update package.json for Appwrite Function
const originalPackageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const functionPackageJson = {
    ...originalPackageJson,
    main: 'src/main.js',
    scripts: {
        start: 'node src/main.js'
    }
};

fs.writeFileSync(path.join(whatsappApiDir, 'package.json'), JSON.stringify(functionPackageJson, null, 2));
console.log('✅ Updated package.json for Appwrite Functions');

// Create .env file for the function
const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.appwrite'), 'utf8');
fs.writeFileSync(path.join(whatsappApiDir, '.env'), envContent);
console.log('✅ Created environment configuration');

console.log('🎉 Build completed! Function ready for deployment');
console.log('📍 Function location: functions/whatsapp-api/');
console.log('🚀 Run: appwrite deploy function');

function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    
    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach(childItemName => {
            copyRecursiveSync(
                path.join(src, childItemName),
                path.join(dest, childItemName)
            );
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}