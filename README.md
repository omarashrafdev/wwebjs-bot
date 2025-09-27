# WhatsApp API Server

A comprehensive Express.js API server for WhatsApp Web integration with student management features, built with `whatsapp-web.js`.

## 🚀 Features

- **WhatsApp Integration**: Full WhatsApp Web API with QR code authentication
- **REST API**: Send single and bulk messages with media support
- **Web Interface**: User-friendly web dashboard for QR authentication and messaging
- **Student Management**: Bulk messaging for educational institutions
- **Real-time Updates**: WebSocket integration for live QR codes and status updates
- **Media Support**: Send images, documents, and other media files
- **API Authentication**: Secure API key-based authentication
- **Rate Limiting**: Protection against API abuse
- **Docker Support**: Complete containerization with Docker Compose
- **Production Ready**: SSL support, Nginx reverse proxy, and security hardening

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