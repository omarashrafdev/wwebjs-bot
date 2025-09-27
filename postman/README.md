# WhatsApp API Postman Collection

This directory contains Postman collection and environment files for testing the WhatsApp API Server.

## 📁 Files Overview

- `WhatsApp-API-Collection.json` - Main Postman collection with all API endpoints
- `WhatsApp-API-Environment-Dev.json` - Development environment variables
- `WhatsApp-API-Environment-Prod.json` - Production environment variables
- `README.md` - This documentation file

## 🚀 Quick Setup

### 1. Import Collection and Environments

1. **Open Postman**
2. **Import Collection:**
   - Click "Import" button
   - Drag and drop `WhatsApp-API-Collection.json` or click "Choose Files"
   - Click "Import"

3. **Import Environments:**
   - Import `WhatsApp-API-Environment-Dev.json` for development
   - Import `WhatsApp-API-Environment-Prod.json` for production

### 2. Configure Environment Variables

#### Development Environment
1. Select "WhatsApp API - Development" environment
2. Update variables:
   ```
   baseUrl: http://localhost:3000 (default)
   apiKey: (leave empty if no API key configured)
   testPhoneNumber: +201234567890 (replace with your test number)
   egyptianPhoneNumber: 01234567890 (for testing local format)
   ```

#### Production Environment
1. Select "WhatsApp API - Production" environment
2. Update variables:
   ```
   baseUrl: https://your-domain.com
   apiKey: your-production-api-key-here
   testPhoneNumber: +201234567890
   egyptianPhoneNumber: 01234567890
   ```

### 3. Configure API Key Authentication (Optional)

If you want to use API key authentication:

1. **Set API Key in Environment:**
   - Go to your environment settings
   - Set the `apiKey` variable to your API key value

2. **Enable API Key in Server:**
   - Update your `.env` file:
     ```env
     API_KEY=your-secure-api-key-here
     ```
   - Restart the server

3. **Authentication Methods:**
   - **Header Method (Recommended):** The collection is pre-configured to use `X-API-Key` header
   - **Query Parameter Method:** Add `?apiKey={{apiKey}}` to request URLs

## 📋 Collection Structure

### 1. Server Management
- **Health Check** - Verify server is running
- **API Documentation** - Get available endpoints

### 2. WhatsApp Client Management
- **Get WhatsApp Status** - Check connection status
- **Get QR Code** - Retrieve QR code for authentication
- **Restart WhatsApp Client** - Restart client connection

### 3. Message Sending
- **Send Single Message** - Send text message to one number
- **Send Message to Egyptian Number** - Test local format conversion
- **Send Bulk Messages** - Send personalized messages to multiple contacts
- **Send Class Announcement** - Example bulk message for students
- **Send Media Message** - Send files with captions
- **Send Image with Caption** - Send images with text

### 4. Contact & Chat Management
- **Get All Chats** - List all WhatsApp chats
- **Get All Contacts** - List all contacts

### 5. Testing & Examples
- **Test Invalid Phone Number** - Validation testing
- **Test Empty Message** - Validation testing
- **Test Long Message** - Character limit testing
- **Test Bulk with Invalid JSON** - Format validation testing

### 6. Rate Limiting Tests
- **Rate Limit Test** - Test API rate limiting

## 🧪 Testing Scenarios

### Basic Message Testing
1. Start with **Health Check** to ensure server is running
2. Check **WhatsApp Status** to verify connection
3. Try **Send Single Message** with a valid phone number
4. Test **Send Message to Egyptian Number** for local format conversion

### Student Management Integration Testing
1. Use **Send Bulk Messages (Student Example)** with student data
2. Try **Send Class Announcement** for group messaging
3. Test **Send Media Message** for document sharing

### Validation Testing
1. Run all requests in the "Testing & Examples" folder
2. Verify proper error responses for invalid input
3. Test rate limiting with multiple rapid requests

### Media Testing
1. **Send Media Message** - Test with PDF, Word documents
2. **Send Image with Caption** - Test with images
3. Make sure to update file paths in the form-data

## 🔧 Customization

### Phone Number Formats
The API supports multiple phone number formats:
- International format: `+201234567890`
- Egyptian local format: `01234567890` (auto-converted to +20)
- Other country formats: Include country code

### Message Templates
For bulk messages, you can use placeholders:
- `{name}` - Contact name
- `{firstName}` - First name
- `{lastName}` - Last name
- `{studentId}` - Student ID
- `{class}` - Class/Grade
- `{grade}` - Grade percentage

### Bulk Message Format
```json
{
  "contacts": [
    {
      "number": "+201234567890",
      "name": "Ahmed Hassan",
      "studentId": "ST001",
      "class": "Grade 10A",
      "grade": "85"
    }
  ],
  "message": "Dear {name}, your grade in {class} is {grade}%",
  "options": {
    "delay": 2000
  }
}
```

## 🔐 Security Considerations

### API Key Configuration
- Never commit API keys to version control
- Use environment variables for API keys
- Different API keys for development and production
- Regularly rotate API keys

### Rate Limiting
- Default: 100 requests per 15 minutes per IP
- Configurable via environment variables
- Monitor rate limit headers in responses

### CORS Configuration
- Development: `CORS_ORIGIN=*`
- Production: Set specific domains

## 🐛 Troubleshooting

### Common Issues

1. **"WhatsApp client is not connected"**
   - Check WhatsApp status endpoint
   - Scan QR code if needed
   - Restart WhatsApp client

2. **"Invalid phone number format"**
   - Use international format (+country code)
   - Check phone number validation regex

3. **"API key required" (when using authentication)**
   - Ensure API_KEY is set in .env
   - Check X-API-Key header is included
   - Verify API key value matches

4. **Rate limit exceeded**
   - Wait for rate limit window to reset
   - Reduce request frequency
   - Check rate limit configuration

5. **File upload errors**
   - Check file size (max 10MB default)
   - Verify file type is allowed
   - Ensure file path is correct

### Debug Mode
Enable debug logging by setting:
```env
LOG_LEVEL=debug
NODE_ENV=development
```

## 📚 Additional Resources

- [WhatsApp Web.js Documentation](https://wwebjs.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [Postman Documentation](https://learning.postman.com/)

## 🤝 Support

For issues and questions:
1. Check server logs for error details
2. Verify environment configuration
3. Test with simple requests first
4. Check network connectivity

## 📝 Example Responses

### Successful Message Send
```json
{
  "success": true,
  "data": {
    "messageId": "msg_id_here",
    "timestamp": 1234567890,
    "to": "+201234567890",
    "body": "Message content"
  },
  "message": "Message sent successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "msg": "Phone number is required",
      "param": "number",
      "location": "body"
    }
  ]
}
```

### Bulk Message Response
```json
{
  "success": true,
  "data": {
    "results": [...],
    "summary": {
      "total": 3,
      "success": 2,
      "failed": 1
    }
  },
  "message": "Bulk messages completed: 2 successful, 1 failed"
}
```