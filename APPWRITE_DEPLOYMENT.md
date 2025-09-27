# Appwrite Deployment Guide for WhatsApp API Server

This guide will help you deploy your WhatsApp API Server on Appwrite Cloud or Self-hosted Appwrite.

## 🚀 Prerequisites

1. **Appwrite Account**: Create an account at [Appwrite Cloud](https://cloud.appwrite.io)
2. **Appwrite CLI**: Install the CLI globally
   ```bash
   npm install -g appwrite-cli
   ```
3. **Node.js Dependencies**: Install Appwrite SDK
   ```bash
   npm install node-appwrite
   ```

## 📝 Step 1: Create Appwrite Project

1. **Login to Appwrite Console**: Go to [https://cloud.appwrite.io/console](https://cloud.appwrite.io/console)

2. **Create New Project**: Click "Create Project" and name it "WhatsApp API Server"

3. **Note Project Details**: 
   - Copy your **Project ID** from Settings
   - Note your **Region** (e.g., `us-east-1`)

## 🔑 Step 2: Create API Key

1. **Go to API Keys Section**: In your project, navigate to "Settings" → "API Keys"

2. **Create Server API Key** with these scopes:
   ```
   ✅ databases.read
   ✅ databases.write
   ✅ tables.read
   ✅ tables.write
   ✅ columns.read
   ✅ columns.write
   ✅ rows.read
   ✅ rows.write
   ✅ files.read
   ✅ files.write
   ✅ buckets.read
   ✅ buckets.write
   ✅ functions.read
   ✅ functions.write
   ```

3. **Copy the API Key**: Save it securely - you'll need it for deployment

## 🗄️ Step 3: Set Up Database and Storage

### Initialize Appwrite CLI
```bash
# Login to Appwrite
appwrite login

# Initialize your project
appwrite init project
# Follow prompts and select your project
```

### Deploy Database Schema
```bash
# Deploy database and collections
appwrite deploy collection
```

This will create:
- **Database**: `WhatsAppDB`
- **Collections**:
  - `Sessions` - WhatsApp session data
  - `Messages` - Message history and logs
  - `Contacts` - Contact management
- **Storage Bucket**: `WhatsApp Media` - File uploads

## ⚙️ Step 4: Configure Environment Variables

1. **Copy Environment Template**:
   ```bash
   cp .env.appwrite .env
   ```

2. **Update Environment Variables** in `.env`:
   ```bash
   # Appwrite Configuration
   APPWRITE_ENDPOINT=https://[YOUR-REGION].cloud.appwrite.io/v1
   APPWRITE_PROJECT_ID=your-project-id-here
   APPWRITE_API_KEY=your-api-key-here

   # Get these IDs after running `appwrite deploy collection`
   APPWRITE_DATABASE_ID=your-database-id
   APPWRITE_SESSIONS_COLLECTION_ID=sessions-collection-id
   APPWRITE_MESSAGES_COLLECTION_ID=messages-collection-id
   APPWRITE_CONTACTS_COLLECTION_ID=contacts-collection-id
   APPWRITE_BUCKET_ID=media-bucket-id

   # Your API Configuration
   API_KEY=your-secure-api-key-here
   
   # WhatsApp Configuration
   WHATSAPP_SESSION_NAME=appwrite-session
   WHATSAPP_HEADLESS=true
   ```

## 🏗️ Step 5: Build for Appwrite Functions

```bash
# Build the application for Appwrite Functions
npm run build:appwrite
```

This creates a `functions/whatsapp-api/` directory with:
- Optimized code for Appwrite Functions
- All dependencies included
- Proper entry point configuration

## 🚀 Step 6: Deploy to Appwrite

### Deploy Function
```bash
# Deploy the WhatsApp API function
appwrite deploy function
```

### Set Function Environment Variables
After deployment, set these environment variables in the Appwrite Console:

**Function Settings** → **Environment Variables**:
```
NODE_ENV=production
APPWRITE_ENDPOINT=https://[region].cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=[your-project-id]
APPWRITE_API_KEY=[your-api-key]
APPWRITE_DATABASE_ID=[database-id]
APPWRITE_SESSIONS_COLLECTION_ID=[sessions-collection-id]
APPWRITE_MESSAGES_COLLECTION_ID=[messages-collection-id]
APPWRITE_CONTACTS_COLLECTION_ID=[contacts-collection-id]
APPWRITE_BUCKET_ID=[bucket-id]
API_KEY=[your-api-key]
WHATSAPP_SESSION_NAME=appwrite-session
WHATSAPP_HEADLESS=true
```

## 🌐 Step 7: Access Your Deployed API

Your WhatsApp API will be available at:
```
https://[project-id].appwrite.global/v1/functions/[function-id]/executions
```

### API Endpoints:
- **Health Check**: `GET /health`
- **WhatsApp Status**: `GET /api/whatsapp/status` 
- **Send Message**: `POST /api/whatsapp/send`
- **Send Bulk Messages**: `POST /api/whatsapp/send-bulk`
- **Send Media**: `POST /api/whatsapp/send-media`
- **Get Contacts**: `GET /api/whatsapp/contacts`

## 📋 Step 8: Test Your Deployment

### Test Health Endpoint
```bash
curl -X GET https://[project-id].appwrite.global/v1/functions/[function-id]/executions/health
```

### Test Send Message
```bash
curl -X POST https://[project-id].appwrite.global/v1/functions/[function-id]/executions/api/whatsapp/send \\
  -H "X-API-Key: your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{"number": "+1234567890", "message": "Hello from Appwrite!"}'
```

## 🔄 Step 9: Update and Redeploy

When you make changes:

```bash
# Rebuild and redeploy
npm run build:appwrite
appwrite deploy function
```

## 📊 Monitoring and Logs

1. **Function Logs**: View in Appwrite Console → Functions → Your Function → Executions
2. **Database Activity**: Monitor in Console → Databases → Your Database
3. **Storage Usage**: Track in Console → Storage → Your Bucket

## 🚨 Troubleshooting

### Common Issues:

1. **Function Timeout**: 
   - Increase timeout in `appwrite.json` (max 900 seconds)
   - WhatsApp initialization can take 30-60 seconds

2. **QR Code Generation**:
   - Ensure Puppeteer is properly configured
   - Check headless mode settings

3. **Database Connection**:
   - Verify collection IDs are correct
   - Check API key permissions

4. **File Upload Issues**:
   - Confirm bucket permissions
   - Check file size limits

### Debug Function Execution:
```bash
# View function logs
appwrite functions listExecutions --functionId=[your-function-id]
```

## 🔐 Security Best Practices

1. **API Key Security**:
   - Use strong, unique API keys
   - Rotate keys regularly
   - Don't commit keys to version control

2. **Function Permissions**:
   - Set appropriate execution permissions
   - Limit API key scopes to minimum required

3. **Database Security**:
   - Configure proper collection permissions
   - Enable audit logs

## 💰 Cost Considerations

### Appwrite Cloud Pricing:
- **Functions**: $0.0000185 per second of execution
- **Database**: $0.50 per 100k operations
- **Storage**: $0.045 per GB per month
- **Bandwidth**: $0.09 per GB

### Optimization Tips:
- Use efficient database queries
- Implement proper caching
- Optimize function execution time
- Monitor resource usage

## 📚 Additional Resources

- [Appwrite Functions Documentation](https://appwrite.io/docs/functions)
- [Appwrite Database Documentation](https://appwrite.io/docs/databases)
- [Node.js SDK Reference](https://appwrite.io/docs/client/node)
- [WhatsApp Web.js Documentation](https://wwebjs.dev/)

## 🆘 Support

If you encounter issues:
1. Check Appwrite Console logs
2. Review function execution history
3. Verify environment variable configuration
4. Test database connectivity

---

**🎉 Congratulations!** Your WhatsApp API Server is now running on Appwrite!

Your application benefits from:
- ✅ Serverless scaling
- ✅ Global CDN
- ✅ Managed database
- ✅ Built-in authentication
- ✅ File storage
- ✅ Real-time capabilities