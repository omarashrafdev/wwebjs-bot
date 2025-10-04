# WhatsApp Web API Server

A production-ready REST API server for WhatsApp Web automation built with Express.js and `whatsapp-web.js`. Send messages, media files, and manage WhatsApp communications programmatically.

# WhatsApp Web API Server

A production-ready REST API server for WhatsApp Web automation built with Express.js and `whatsapp-web.js`. Send messages, media files, and manage WhatsApp communications programmatically.

## 📑 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
  - [Authentication](#authentication)
  - [Status & Health Check](#status--health-check)
  - [QR Code Endpoints](#qr-code-endpoints)
  - [Messaging Endpoints](#messaging-endpoints)
  - [Chat Management](#chat-management)
- [Error Handling](#-error-handling)
- [Rate Limiting](#-rate-limiting)
- [Examples](#-examples)
- [Production Deployment](#-production-deployment)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

## ✨ Features

- **WhatsApp Web Integration**: Full integration with WhatsApp Web using puppeteer
- **QR Code Authentication**: Easy authentication with QR code scanning
- **Single & Bulk Messaging**: Send individual or bulk messages efficiently
- **Media Support**: Send images, documents, PDFs, and other media files
- **REST API**: Clean and well-documented RESTful API
- **Rate Limiting**: Built-in protection against API abuse
- **CORS Support**: Configurable cross-origin resource sharing
- **File Upload**: Secure file upload handling with size limits
- **Session Persistence**: Maintains WhatsApp session across restarts
- **Error Handling**: Comprehensive error handling and logging
- **Production Ready**: Optimized for both development and production environments

## 📋 Prerequisites

- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher
- **Google Chrome** or **Chromium**: Required for WhatsApp Web automation
- **WhatsApp Account**: Active WhatsApp account on your mobile device

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/omarashrafdev/wwebjs-bot.git
cd wwebjs-bot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit the `.env` file with your settings (see [Configuration](#-configuration) section).

### 4. Start the Server

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured port).

## ⚙️ Configuration

The application is configured using environment variables in the `.env` file:

### Server Configuration

```bash
NODE_ENV=development          # Environment: development or production
PORT=3000                     # Server port
HOST=0.0.0.0                 # Server host (0.0.0.0 for all interfaces)
```

### API Security

```bash
API_KEY=your-api-key-here    # Optional: API key for authentication
                             # Leave empty to disable API key authentication
```

### Rate Limiting

```bash
RATE_LIMIT_WINDOW_MS=900000      # Time window in milliseconds (15 minutes)
RATE_LIMIT_MAX_REQUESTS=100      # Max requests per window
```

### WhatsApp Configuration

```bash
WHATSAPP_SESSION_NAME=default-session    # Session name for persistence
WHATSAPP_HEADLESS=true                   # Run browser in headless mode
WHATSAPP_DEVTOOLS=false                  # Enable browser DevTools
```

### Chrome Configuration

```bash
# For macOS (development):
CHROME_EXECUTABLE_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome

# For Windows (production):
# CHROME_EXECUTABLE_PATH=C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe

# Leave empty to use bundled Chromium
```

### Message Configuration

```bash
DEFAULT_MESSAGE_DELAY=1000    # Delay between messages (ms)
BULK_MESSAGE_DELAY=2000       # Delay for bulk messages (ms)
MAX_BULK_RECIPIENTS=50        # Maximum bulk recipients per request
```

### File Upload Configuration

```bash
MAX_FILE_SIZE=10485760       # Max file size in bytes (10MB)
UPLOAD_DIR=uploads           # Upload directory
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf
```

### CORS Configuration

```bash
CORS_ORIGIN=*               # Allowed origins (* for all)
CORS_CREDENTIALS=true       # Allow credentials
```

## 🎯 Quick Start

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Check server status:**
   ```bash
   curl http://localhost:3000/
   ```

3. **Get QR code:**
   - Visit `http://localhost:3000/api/qr/image` in your browser
   - Scan with WhatsApp mobile app (Settings → Linked Devices → Link a Device)

4. **Wait for authentication:**
   - Server logs will show "WhatsApp client is ready!" when connected

5. **Send your first message:**
   ```bash
   curl -X POST http://localhost:3000/api/whatsapp/send \
     -H "Content-Type: application/json" \
     -d '{
       "to": "1234567890",
       "message": "Hello from WhatsApp API!"
     }'
   ```

## 📚 API Documentation

### Base URL

```
http://localhost:3000
```

### Authentication

If `API_KEY` is configured in your environment, include it in your requests:

**Option 1: Header Authentication (Recommended)**
```bash
X-API-Key: your-api-key-here
```

**Option 2: Query Parameter**
```bash
?apikey=your-api-key-here
```

Example:
```bash
curl -H "X-API-Key: your-api-key" http://localhost:3000/api/status
```

---

### Status & Health Check

#### 1. Root Health Check

Check if the server is running.

**Endpoint:** `GET /`

**Response:**
```json
{
  "status": "WhatsApp API Server is running",
  "version": "1.0.0",
  "timestamp": "2025-10-04T12:00:00.000Z"
}
```

**Example:**
```bash
curl http://localhost:3000/
```

---

#### 2. Get WhatsApp Status

Get the current status of the WhatsApp client.

**Endpoint:** `GET /api/status`

**Response:**
```json
{
  "ready": true,
  "hasQR": false,
  "initializing": false
}
```

**Fields:**
- `ready` (boolean): WhatsApp client is authenticated and ready
- `hasQR` (boolean): QR code is available for scanning
- `initializing` (boolean): Client is currently initializing

**Example:**
```bash
curl http://localhost:3000/api/status
```

---

### QR Code Endpoints

#### 3. Get QR Code (Base64)

Get the QR code as a base64-encoded data URL.

**Endpoint:** `GET /api/qr`

**Response:**
```json
{
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Error Response (404):**
```json
{
  "error": "QR code not available"
}
```

**Example:**
```bash
curl http://localhost:3000/api/qr
```

---

#### 4. Get QR Code (Image)

Get the QR code as a PNG image.

**Endpoint:** `GET /api/qr/image`

**Response:** PNG image (Content-Type: image/png)

**Error Response (404):**
```json
{
  "error": "QR code not available"
}
```

**Example:**
```bash
# View in browser
open http://localhost:3000/api/qr/image

# Download with curl
curl http://localhost:3000/api/qr/image -o qrcode.png
```

---

### Messaging Endpoints

#### 5. Send Single Message

Send a text message to a single recipient.

**Endpoint:** `POST /api/whatsapp/send`

**Request Body:**
```json
{
  "to": "1234567890",
  "message": "Hello from WhatsApp API!"
}
```

**Parameters:**
- `to` (string, required): Phone number (with or without country code)
- `message` (string, required): Text message to send

**Response (Success):**
```json
{
  "success": true,
  "messageId": "true_1234567890@c.us_ABCDEF1234567890"
}
```

**Error Response (400):**
```json
{
  "error": "Missing required fields: to, message"
}
```

**Error Response (500):**
```json
{
  "error": "WhatsApp client is not ready"
}
```

**Phone Number Format:**
- Automatically formats phone numbers
- Adds country code if missing (defaults to Egypt +20)
- Examples: `1234567890`, `+201234567890`, `201234567890`

**Example:**
```bash
curl -X POST http://localhost:3000/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "1234567890",
    "message": "Hello! This is a test message."
  }'
```

---

#### 6. Send Bulk Messages

Send the same message to multiple recipients.

**Endpoint:** `POST /api/whatsapp/send/bulk`

**Request Body:**
```json
{
  "recipients": ["1234567890", "0987654321", "+201111111111"],
  "message": "Hello everyone! This is a bulk message."
}
```

**Parameters:**
- `recipients` (array, required): Array of phone numbers (max 50)
- `message` (string, required): Text message to send

**Response:**
```json
{
  "results": [
    {
      "recipient": "1234567890",
      "success": true,
      "messageId": "true_1234567890@c.us_ABCDEF1234567890"
    },
    {
      "recipient": "0987654321",
      "success": false,
      "error": "Failed to send message: Invalid number"
    }
  ]
}
```

**Error Response (400):**
```json
{
  "error": "Missing required fields: recipients (array), message"
}
```

```json
{
  "error": "Maximum 50 recipients allowed"
}
```

**Features:**
- Automatically delays between messages (configured via `BULK_MESSAGE_DELAY`)
- Returns individual success/failure for each recipient
- Continues sending even if some messages fail

**Example:**
```bash
curl -X POST http://localhost:3000/api/whatsapp/send/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": [
      "1234567890",
      "0987654321",
      "1111111111"
    ],
    "message": "Hello! This is a bulk notification."
  }'
```

---

#### 7. Send Media Message

Send a media file (image, document, video, etc.) with an optional caption.

**Endpoint:** `POST /api/whatsapp/send/media`

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `to` (string, required): Phone number
- `caption` (string, optional): Caption for the media
- `file` (file, required): Media file to send

**Response (Success):**
```json
{
  "success": true,
  "messageId": "true_1234567890@c.us_ABCDEF1234567890"
}
```

**Error Response (400):**
```json
{
  "error": "Missing required fields: to, file"
}
```

**Supported File Types:**
- Images: JPEG, PNG, GIF
- Documents: PDF, DOC, DOCX, TXT
- Videos: MP4, MOV
- Audio: MP3, OGG, WAV

**Size Limit:** Configured via `MAX_FILE_SIZE` (default: 10MB)

**Example (curl):**
```bash
curl -X POST http://localhost:3000/api/whatsapp/send/media \
  -F "to=1234567890" \
  -F "caption=Check out this document!" \
  -F "file=@/path/to/document.pdf"
```

**Example (JavaScript with FormData):**
```javascript
const formData = new FormData();
formData.append('to', '1234567890');
formData.append('caption', 'Check this out!');
formData.append('file', fileInput.files[0]);

fetch('http://localhost:3000/api/whatsapp/send/media', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

---

### Chat Management

#### 8. Get Chats

Retrieve all WhatsApp chats.

**Endpoint:** `GET /api/whatsapp/chats`

**Response:**
```json
{
  "chats": [
    {
      "id": "1234567890@c.us",
      "name": "John Doe",
      "isGroup": false,
      "unreadCount": 5
    },
    {
      "id": "123456789@g.us",
      "name": "Project Team",
      "isGroup": true,
      "unreadCount": 12
    }
  ]
}
```

**Fields:**
- `id` (string): Chat ID
- `name` (string): Contact or group name
- `isGroup` (boolean): Whether this is a group chat
- `unreadCount` (number): Number of unread messages

**Example:**
```bash
curl http://localhost:3000/api/whatsapp/chats
```

---

#### 9. Restart WhatsApp Client

Restart the WhatsApp client (useful for reconnection).

**Endpoint:** `POST /api/whatsapp/restart`

**Response:**
```json
{
  "message": "WhatsApp client restarted successfully"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/whatsapp/restart
```

---

## ⚠️ Error Handling

### Error Response Format

All error responses follow this structure:

```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes

| Status Code | Meaning | Description |
|------------|---------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Missing or invalid parameters |
| 401 | Unauthorized | Invalid or missing API key |
| 404 | Not Found | Resource not found (e.g., QR code not available) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server or WhatsApp client error |

### Common Error Messages

| Error Message | Cause | Solution |
|--------------|-------|----------|
| `WhatsApp client is not ready` | Client not authenticated | Scan QR code or wait for initialization |
| `Missing required fields: to, message` | Invalid request body | Include all required fields |
| `QR code not available` | Client already authenticated or not initialized | Check `/api/status` endpoint |
| `Maximum 50 recipients allowed` | Too many bulk recipients | Split into smaller batches |
| `Invalid API key` | Wrong or missing API key | Check your API key configuration |
| `Too many requests` | Rate limit exceeded | Wait before making more requests |

---

## 🛡️ Rate Limiting

The API implements rate limiting to prevent abuse:

- **Default Limit:** 100 requests per 15 minutes per IP address
- **Applies to:** All `/api/*` endpoints
- **Configuration:** Set `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS` in `.env`

**Rate Limit Response (429):**
```json
{
  "message": "Too many requests, please try again later."
}
```

**Best Practices:**
- Implement exponential backoff in your client
- Cache responses when possible
- Use bulk endpoints for multiple operations
- Monitor your request rate

---

## 💡 Examples

### Example 1: Complete Workflow

```bash
# 1. Check server health
curl http://localhost:3000/

# 2. Check WhatsApp status
curl http://localhost:3000/api/status

# 3. Get QR code (if not authenticated)
curl http://localhost:3000/api/qr/image -o qrcode.png

# 4. Send a message
curl -X POST http://localhost:3000/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{"to": "1234567890", "message": "Hello!"}'

# 5. Get chats
curl http://localhost:3000/api/whatsapp/chats
```

### Example 2: Node.js Client

```javascript
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';
const API_KEY = 'your-api-key-here';

// Create axios instance with API key
const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'X-API-Key': API_KEY
  }
});

// Check status
async function checkStatus() {
  const response = await client.get('/api/status');
  console.log('Status:', response.data);
  return response.data;
}

// Send message
async function sendMessage(to, message) {
  try {
    const response = await client.post('/api/whatsapp/send', {
      to,
      message
    });
    console.log('Message sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// Send bulk messages
async function sendBulkMessages(recipients, message) {
  try {
    const response = await client.post('/api/whatsapp/send/bulk', {
      recipients,
      message
    });
    console.log('Bulk messages sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
(async () => {
  await checkStatus();
  await sendMessage('1234567890', 'Hello from Node.js!');
  await sendBulkMessages(
    ['1234567890', '0987654321'],
    'Bulk message from Node.js!'
  );
})();
```

### Example 3: Python Client

```python
import requests
import json

API_BASE_URL = 'http://localhost:3000'
API_KEY = 'your-api-key-here'

headers = {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY
}

# Check status
def check_status():
    response = requests.get(f'{API_BASE_URL}/api/status', headers=headers)
    print('Status:', response.json())
    return response.json()

# Send message
def send_message(to, message):
    data = {
        'to': to,
        'message': message
    }
    response = requests.post(
        f'{API_BASE_URL}/api/whatsapp/send',
        headers=headers,
        json=data
    )
    print('Message sent:', response.json())
    return response.json()

# Send media message
def send_media(to, file_path, caption=''):
    with open(file_path, 'rb') as file:
        files = {'file': file}
        data = {
            'to': to,
            'caption': caption
        }
        response = requests.post(
            f'{API_BASE_URL}/api/whatsapp/send/media',
            data=data,
            files=files,
            headers={'X-API-Key': API_KEY}  # No Content-Type for multipart
        )
    print('Media sent:', response.json())
    return response.json()

# Usage
if __name__ == '__main__':
    check_status()
    send_message('1234567890', 'Hello from Python!')
    send_media('1234567890', '/path/to/image.jpg', 'Check this image!')
```

### Example 4: Using with Postman

1. **Import Collection:** Use the provided Postman collection in the `postman/` directory

2. **Set Environment Variables:**
   - `baseUrl`: `http://localhost:3000`
   - `apiKey`: Your API key (if configured)
   - `testPhoneNumber`: Your test phone number

3. **Test Endpoints:**
   - Start with "Health Check"
   - Check "WhatsApp Status"
   - View "Get QR Code"
   - Try "Send Message"

---

## 🚀 Production Deployment

### Environment Configuration

For production deployment, update your `.env`:

```bash
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Set a strong API key
API_KEY=your-secure-api-key-here

# Enable stricter rate limiting
RATE_LIMIT_MAX_REQUESTS=50
RATE_LIMIT_WINDOW_MS=900000

# Use headless mode
WHATSAPP_HEADLESS=true

# Windows Chrome path
CHROME_EXECUTABLE_PATH=C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe
```

### Using PM2 (Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start app.js --name whatsapp-api

# View logs
pm2 logs whatsapp-api

# Monitor
pm2 monit

# Restart
pm2 restart whatsapp-api

# Setup startup script
pm2 startup
pm2 save
```

### Using Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-slim

# Install Chrome dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]
```

Build and run:

```bash
# Build image
docker build -t whatsapp-api .

# Run container
docker run -d \
  --name whatsapp-api \
  -p 3000:3000 \
  -v $(pwd)/.wwebjs_auth:/app/.wwebjs_auth \
  -e API_KEY=your-api-key \
  whatsapp-api
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Security Best Practices

1. **Always use HTTPS in production**
2. **Set a strong API key**
3. **Implement IP whitelisting if possible**
4. **Keep dependencies updated:** `npm audit fix`
5. **Use environment-specific configurations**
6. **Monitor logs regularly**
7. **Implement request logging and monitoring**
8. **Set up proper firewall rules**

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. QR Code Not Appearing

**Symptoms:** `/api/qr` returns 404

**Solutions:**
- Wait a few seconds for initialization
- Check if already authenticated: `GET /api/status`
- Restart the client: `POST /api/whatsapp/restart`
- Check server logs for errors

#### 2. WhatsApp Client Not Ready

**Symptoms:** "WhatsApp client is not ready" error

**Solutions:**
- Scan the QR code if not authenticated
- Check `/api/status` to see client state
- Verify Chrome/Chromium is installed correctly
- Check `CHROME_EXECUTABLE_PATH` in `.env`

#### 3. Messages Not Sending

**Symptoms:** Send message fails or times out

**Solutions:**
- Verify phone number format (include country code)
- Check if recipient number exists on WhatsApp
- Ensure client is ready: `GET /api/status`
- Check rate limits and delays
- Review server logs for specific errors

#### 4. Chrome/Chromium Issues

**Symptoms:** Browser fails to launch

**Solutions:**

**macOS:**
```bash
# Verify Chrome path
ls "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# Update .env
CHROME_EXECUTABLE_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome
```

**Windows:**
```bash
# Verify Chrome path
dir "C:\Program Files\Google\Chrome\Application\chrome.exe"

# Update .env
CHROME_EXECUTABLE_PATH=C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe
```

**Linux:**
```bash
# Install Chromium
sudo apt-get install chromium-browser

# Or leave CHROME_EXECUTABLE_PATH empty to use bundled Chromium
```

#### 5. Session Lost After Restart

**Symptoms:** Need to scan QR code after every restart

**Solutions:**
- Ensure `.wwebjs_auth` directory has write permissions
- Check `WHATSAPP_SESSION_NAME` is set correctly
- Don't delete `.wwebjs_auth` directory
- Verify disk space is available

#### 6. Rate Limit Issues

**Symptoms:** 429 Too Many Requests

**Solutions:**
- Implement delays between requests
- Increase `RATE_LIMIT_MAX_REQUESTS` in `.env`
- Use bulk endpoints for multiple messages
- Implement client-side rate limiting

### Debug Mode

Enable verbose logging:

```bash
# In .env
LOG_LEVEL=debug
WHATSAPP_DEVTOOLS=true
WHATSAPP_HEADLESS=false
```

### Viewing Logs

```bash
# Real-time logs (if using PM2)
pm2 logs whatsapp-api

# Docker logs
docker logs -f whatsapp-api

# Standard output
npm start
```

### Getting Help

If you're still experiencing issues:

1. Check the [GitHub Issues](https://github.com/omarashrafdev/wwebjs-bot/issues)
2. Review [whatsapp-web.js documentation](https://wwebjs.dev/)
3. Enable debug mode and check logs
4. Ensure all dependencies are up to date: `npm update`

---

## 📁 Project Structure

```
wwebjs-bot/
├── app.js                    # Application entry point
├── package.json              # Dependencies and scripts
├── .env                      # Environment configuration (create from .env.example)
├── .env.example              # Example environment configuration
├── README.md                 # This documentation
├── .gitignore               # Git ignore rules
│
├── src/
│   ├── server.js            # Express server setup and routes
│   ├── whatsapp.js          # WhatsApp service class
│   │
│   └── config/
│       └── config.js        # Configuration management
│
├── .wwebjs_auth/            # WhatsApp session data (auto-generated)
│   └── session-*/           # Session files (persistent)
│
├── uploads/                 # Temporary upload directory (auto-generated)
│
└── node_modules/            # Dependencies (auto-generated)
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

## ⚠️ Disclaimer

This project is not affiliated with, authorized, maintained, sponsored or endorsed by WhatsApp or any of its affiliates or subsidiaries. This is an independent and unofficial software. Use at your own risk.

**Important Notes:**
- WhatsApp's Terms of Service prohibit the use of unofficial clients
- This tool is for educational and personal use only
- Excessive or commercial use may result in your WhatsApp number being banned
- Always respect WhatsApp's rate limits and terms of service
- Use responsibly and ethically

---

## 🔗 Useful Resources

- [whatsapp-web.js Documentation](https://wwebjs.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [Puppeteer Documentation](https://pptr.dev/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## 📞 Support

For questions, issues, or feature requests:

- **GitHub Issues:** [Create an issue](https://github.com/omarashrafdev/wwebjs-bot/issues)
- **Email:** Contact the repository owner
- **Documentation:** This README file

---

**Built with ❤️ using Node.js, Express.js, and whatsapp-web.js**

---

## 📝 Changelog

### Version 1.0.0 (Current)
- Initial release
- Single and bulk messaging
- Media message support
- QR code authentication
- Rate limiting
- API key authentication
- Session persistence
- Cross-platform Chrome/Chromium support
- Comprehensive error handling

---

*Last Updated: October 4, 2025*

## 📋 Prerequisites

- Node.js 18+ or Docker
- Chrome/Chromium browser (for WhatsApp Web)
- (Optional) Redis for session storage

## 🛠️ Installation

### Option 1: Appwrite Cloud Deployment (Recommended)

Deploy to Appwrite Cloud for serverless, scalable hosting:

1. **Install Appwrite CLI**:
   ```bash
   npm install -g appwrite-cli
   ```

2. **Configure for Appwrite**:
   ```bash
   cp .env.appwrite .env
   # Edit .env with your Appwrite project details
   ```

3. **Build and Deploy**:
   ```bash
   npm run build:appwrite
   appwrite deploy function
   ```

📋 **[Complete Appwrite Deployment Guide](APPWRITE_DEPLOYMENT.md)**

### Option 2: Docker Deployment

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd wwebjs-bot
   ```

2. **Make deployment script executable**:
   ```bash
   chmod +x deploy.sh
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Deploy the application**:
   ```bash
   ./deploy.sh
   ```

### Option 3: Manual Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start the application**:
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 🌐 API Endpoints

### Authentication
All API endpoints require an API key in the header:
```bash
Authorization: Bearer YOUR_API_KEY
```

### Core Endpoints

#### 1. Health Check
```bash
GET /health
```

#### 2. WhatsApp Status
```bash
GET /api/whatsapp/status
```

#### 3. Send Message
```bash
POST /api/whatsapp/send-message
Content-Type: application/json

{
  "number": "1234567890",
  "message": "Hello from WhatsApp API!"
}
```

#### 4. Send Bulk Messages
```bash
POST /api/whatsapp/send-bulk
Content-Type: application/json

{
  "recipients": [
    {
      "number": "1234567890",
      "name": "John Doe",
      "message": "Hello John!"
    },
    {
      "number": "0987654321", 
      "name": "Jane Smith",
      "message": "Hello Jane!"
    }
  ]
}
```

#### 5. Send Media Message
```bash
POST /api/whatsapp/send-media
Content-Type: multipart/form-data

number=1234567890
caption=Check this out!
media=[file upload]
```

#### 6. Get Contacts
```bash
GET /api/whatsapp/contacts
```

## 🖥️ Web Interface

Access the web interface at:
- **HTTP**: `http://localhost` 
- **HTTPS**: `https://localhost`

Features:
- QR code authentication
- Real-time connection status
- Send individual messages
- Bulk message management
- File upload for media messages

## 📊 Postman Collection

Import the Postman collection from the `postman/` directory:

1. Open Postman
2. Import `postman/WhatsApp_API_Collection.json`
3. Import environment from `postman/environments/`
4. Set your API key in the environment variables

## 🐳 Docker Commands

```bash
# Deploy application
./deploy.sh

# Start development environment
./deploy.sh dev

# View logs
./deploy.sh logs

# Stop services  
./deploy.sh stop

# Restart services
./deploy.sh restart

# Clean up (remove all containers and images)
./deploy.sh clean

# Create backup
./deploy.sh backup
```

## 🔧 Configuration

### Environment Variables

Key configuration options in `.env`:

```bash
# Server
NODE_ENV=production
PORT=3000
API_KEY=your-api-key-here

# WhatsApp
WHATSAPP_SESSION_NAME=default-session
WHATSAPP_HEADLESS=true

# Security
RATE_LIMIT_MAX_REQUESTS=100
SSL_ENABLED=false

# Features
FEATURE_BULK_MESSAGING=true
FEATURE_MEDIA_MESSAGES=true
FEATURE_STUDENT_MANAGEMENT=true
```

### Docker Compose Services

- **whatsapp-api**: Main application server
- **redis**: Session storage and caching
- **nginx**: Reverse proxy with SSL termination

### Appwrite Cloud Services

- **Functions**: Serverless WhatsApp API execution
- **Database**: Session, message, and contact storage
- **Storage**: Media file uploads and management
- **CDN**: Global content delivery

## 🔒 Security Features

- API key authentication
- Rate limiting protection
- CORS configuration
- Security headers (Helmet.js)
- Input validation and sanitization
- File upload restrictions
- SSL/TLS support

## 📁 Project Structure

```
wwebjs-bot/
├── src/
│   ├── config/          # Configuration files
│   ├── middleware/      # Express middleware
│   ├── routes/          # API route handlers
│   └── services/        # Business logic services
├── public/              # Static web files
├── views/               # HTML templates
├── postman/             # API testing collection
├── ssl/                 # SSL certificates
├── uploads/             # File uploads
├── logs/                # Application logs
├── docker-compose.yml   # Production Docker setup
├── docker-compose.dev.yml # Development Docker setup
├── Dockerfile           # Container configuration
├── nginx.conf           # Nginx configuration
└── deploy.sh           # Deployment script
```

## 🚦 Getting Started

1. **First Time Setup**:
   ```bash
   ./deploy.sh
   ```

2. **Access the web interface**: Navigate to `http://localhost`

3. **Scan QR Code**: Use your phone's WhatsApp to scan the QR code

4. **Test API**: Use the Postman collection or curl:
   ```bash
   curl -X POST http://localhost/api/whatsapp/send-message \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"number":"1234567890","message":"Hello World!"}'
   ```

## 🔍 Monitoring & Logs

- **Application Logs**: `./logs/app.log`
- **Docker Logs**: `docker-compose logs -f`
- **Health Check**: `GET /health`
- **Status Check**: `GET /api/whatsapp/status`

## 🎓 Student Management Features

- Bulk messaging to student groups
- Contact import/export
- Message templates
- Student data management
- Personalized messaging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This project is not officially affiliated with WhatsApp. Use responsibly and in accordance with WhatsApp's Terms of Service.

## 🆘 Support

- Check the logs: `./deploy.sh logs`
- Review the health check: `GET /health`
- Restart services: `./deploy.sh restart`
- Clean deployment: `./deploy.sh clean && ./deploy.sh`

## 🔗 Useful Links

- [whatsapp-web.js Documentation](https://wwebjs.dev/)
- [Express.js Guide](https://expressjs.com/)
- [Docker Documentation](https://docs.docker.com/)
- [Postman Documentation](https://learning.postman.com/)

---

**Made with ❤️ for educational institutions and developers**

### Security & Performance
- **Rate Limiting** - Prevent API abuse
- **Input Validation** - Comprehensive request validation
- **API Key Authentication** - Optional API key protection
- **CORS Support** - Configurable cross-origin requests
- **File Upload Validation** - Secure media file handling

## 📋 Prerequisites

- Node.js (v14 or higher)
- Google Chrome browser installed
- WhatsApp mobile app

## 🛠️ Installation

1. **Clone or download the project:**
   ```bash
   git clone <repository-url>
   cd wwebjs-bot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file as needed:
   ```env
   PORT=3000
   HOST=localhost
   API_KEY=your-optional-api-key
   MESSAGE_DELAY=2000
   MAX_BULK_MESSAGES=50
   ```

4. **Start the server:**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## 🌐 Usage

### Web Interface

1. Open your browser and navigate to `http://localhost:3000`
2. Scan the QR code with your WhatsApp mobile app:
   - Open WhatsApp on your phone
   - Go to Settings → Linked Devices → Link a Device
   - Scan the QR code displayed on the web interface
3. Once connected, you can send messages through the web interface

### Postman Collection

A comprehensive Postman collection is included for API testing:

1. **Import Collection:**
   - Import `postman/WhatsApp-API-Collection.json`
   - Import `postman/WhatsApp-API-Environment-Dev.json`

2. **Configure Environment:**
   - Set `baseUrl` to `http://localhost:3000`
   - Set `apiKey` if using API key authentication
   - Set `testPhoneNumber` to your test number

3. **Start Testing:**
   - Begin with "Health Check" and "WhatsApp Status"
   - Test message sending with various scenarios
   - See `postman/README.md` for detailed instructions

### API Endpoints

#### Authentication
If `API_KEY` is set in your environment, include it in requests:
```bash
# Header method
curl -H "X-API-Key: your-api-key" ...

# Query parameter method
curl "http://localhost:3000/api/whatsapp/status?apiKey=your-api-key"
```

#### Send Single Message
```bash
curl -X POST http://localhost:3000/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{
    "number": "+201234567890",
    "message": "Hello from WhatsApp API!"
  }'
```

#### Send Bulk Messages
```bash
curl -X POST http://localhost:3000/api/whatsapp/send-bulk \
  -H "Content-Type: application/json" \
  -d '{
    "contacts": [
      {"number": "+201234567890", "name": "Ahmed Ali", "studentId": "2023001", "class": "Grade 10A"},
      {"number": "+201234567891", "name": "Sara Mohamed", "studentId": "2023002", "class": "Grade 10A"}
    ],
    "message": "Dear {name}, your student ID {studentId} has been assigned to {class}.",
    "options": {"delay": 2000}
  }'
```

#### Send Media Message
```bash
curl -X POST http://localhost:3000/api/whatsapp/send-media \
  -F "number=+201234567890" \
  -F "message=Check out this document!" \
  -F "media=@/path/to/your/file.pdf"
```

#### Get Status
```bash
curl http://localhost:3000/api/whatsapp/status
```

#### Get QR Code
```bash
curl http://localhost:3000/api/whatsapp/qr
```

## 📁 Project Structure

```
wwebjs-bot/
├── app.js                 # Main application entry point
├── package.json          # Dependencies and scripts
├── .env.example          # Environment configuration template
├── README.md             # This file
├── postman/              # Postman collection and environments
│   ├── WhatsApp-API-Collection.json     # Postman collection
│   ├── WhatsApp-API-Environment-Dev.json   # Development environment
│   ├── WhatsApp-API-Environment-Prod.json  # Production environment
│   ├── test-scripts.js              # Automated test scripts
│   └── README.md                    # Postman documentation
├── src/
│   ├── config/
│   │   └── config.js     # Application configuration
│   ├── services/
│   │   └── whatsappService.js  # WhatsApp client service
│   ├── routes/
│   │   └── whatsapp.js   # API routes
│   ├── middleware/
│   │   ├── auth.js       # Authentication middleware
│   │   └── validation.js # Request validation
│   ├── utils/
│   │   └── logger.js     # Logging utility
│   └── server.js         # Express server setup
├── public/
│   ├── css/
│   │   └── styles.css    # Web interface styles
│   └── js/
│       └── main.js       # Client-side JavaScript
├── views/
│   └── index.html        # Web interface template
└── uploads/              # Media file uploads (auto-created)
```

## 🎓 Student Management Integration Examples

### 1. Class Announcements
```javascript
const classAnnouncement = {
  "contacts": [
    {"number": "+201234567890", "name": "Ahmed Ali", "class": "Grade 10A"},
    {"number": "+201234567891", "name": "Sara Mohamed", "class": "Grade 10A"}
  ],
  "message": "Dear {name},\n\nImportant announcement for {class}:\n\nTomorrow's math exam has been postponed to next Friday. Please prepare accordingly.\n\nBest regards,\nSchool Administration"
}
```

### 2. Grade Notifications
```javascript
const gradeNotification = {
  "contacts": [
    {"number": "+201234567890", "name": "Ahmed Ali", "studentId": "2023001", "grade": "A+"},
    {"number": "+201234567891", "name": "Sara Mohamed", "studentId": "2023002", "grade": "A"}
  ],
  "message": "Congratulations {name}!\n\nYour final grade for Mathematics is: {grade}\n\nStudent ID: {studentId}\n\nKeep up the excellent work!"
}
```

### 3. Parent Notifications
```javascript
const parentNotification = {
  "contacts": [
    {"number": "+201234567892", "name": "Mohamed Ali", "studentName": "Ahmed Ali", "class": "Grade 10A"},
    {"number": "+201234567893", "name": "Fatima Mohamed", "studentName": "Sara Mohamed", "class": "Grade 10A"}
  ],
  "message": "Dear {name},\n\nThis is to inform you that your child {studentName} from {class} will have a parent-teacher meeting scheduled for next Tuesday at 3 PM.\n\nPlease confirm your attendance.\n\nThank you."
}
```

## ⚙️ Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `HOST` | localhost | Server host |
| `API_KEY` | null | Optional API authentication key |
| `CORS_ORIGIN` | * | CORS allowed origins |
| `RATE_LIMIT_MAX` | 100 | Max requests per window |
| `MESSAGE_DELAY` | 2000 | Delay between bulk messages (ms) |
| `MAX_BULK_MESSAGES` | 50 | Maximum contacts in bulk operation |
| `CHROME_PATH` | auto-detected | Custom Chrome executable path |

### Message Template Placeholders

| Placeholder | Description |
|-------------|-------------|
| `{name}` | Full name |
| `{firstName}` | First name |
| `{lastName}` | Last name |
| `{studentId}` | Student ID number |
| `{class}` | Class/grade level |
| `{grade}` | Academic grade |

## 📚 API Reference

### Response Format
All API responses follow this format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

### Status Codes
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid API key)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## 🔧 Troubleshooting

### Common Issues

1. **QR Code not displaying:**
   - Check if Chrome is installed and accessible
   - Verify Chrome executable path in configuration
   - Restart the application

2. **Messages not sending:**
   - Ensure WhatsApp client is connected (green status)
   - Check phone number format (include country code)
   - Verify rate limits aren't exceeded

3. **Authentication failures:**
   - Clear browser cache and cookies
   - Restart the application
   - Re-scan QR code

4. **File upload issues:**
   - Check file size (max 10MB by default)
   - Verify file type is supported
   - Ensure uploads directory has write permissions

## 📝 Development

### Running in Development Mode
```bash
npm run dev
```

### Adding New Features
1. Create feature branch
2. Add routes in `src/routes/`
3. Update service in `src/services/whatsappService.js`
4. Add validation in `src/middleware/validation.js`
5. Update web interface if needed
6. Test thoroughly

### Logging
Logs are automatically written to `logs/` directory with daily rotation.

## 🔒 Security Considerations

- Always use HTTPS in production
- Set strong API keys
- Configure CORS properly
- Implement rate limiting
- Validate all inputs
- Keep dependencies updated
- Monitor logs for suspicious activity

## 📄 License

This project is licensed under the ISC License.

## 🤝 Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check browser console for errors
4. Verify network connectivity

## 🎉 Acknowledgments

- Built with [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)
- UI powered by [Bootstrap 5](https://getbootstrap.com)
- Real-time updates via [Socket.IO](https://socket.io)