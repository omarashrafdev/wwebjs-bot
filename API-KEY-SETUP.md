# API Key Configuration Guide

## Setting up API Key Authentication

### 1. Enable API Key Authentication

Edit your `.env` file and add:

```env
# API Security - Uncomment and set for production
API_KEY=your-super-secure-api-key-here-make-it-long-and-random
```

**Example API Key (DO NOT use this in production):**
```env
API_KEY=whatsapp_api_2025_secure_key_Kj9Lm2Nx8Qp4Rt6Yw1Ez5Cv3Bn7Df0
```

### 2. Generate Secure API Keys

#### Option 1: Using Node.js
```javascript
const crypto = require('crypto');
console.log('API Key:', crypto.randomBytes(32).toString('hex'));
```

#### Option 2: Using OpenSSL (Terminal)
```bash
openssl rand -hex 32
```

#### Option 3: Using Online Generator
Visit a secure password generator and create a 64-character random string.

### 3. Using API Key in Requests

#### Method 1: Header (Recommended)
```bash
curl -X POST http://localhost:3000/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{"number": "+201234567890", "message": "Hello!"}'
```

#### Method 2: Query Parameter
```bash
curl -X POST "http://localhost:3000/api/whatsapp/send?apiKey=your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{"number": "+201234567890", "message": "Hello!"}'
```

### 4. Postman Configuration

1. **Set Environment Variable:**
   - Open Postman environment
   - Set `apiKey` variable to your API key value

2. **Collection Authentication:**
   - The collection is pre-configured to use `X-API-Key` header
   - Authentication is inherited by all requests

3. **Override for Specific Requests:**
   - Go to request → Authorization tab
   - Select "API Key"
   - Key: `X-API-Key`
   - Value: `{{apiKey}}`

### 5. Security Best Practices

#### Development
- Use a simple API key for testing
- API key can be shorter (e.g., 32 characters)
- Store in `.env` file (never commit to git)

#### Production
- Use a strong, randomly generated API key (64+ characters)
- Store in secure environment variables
- Rotate API keys regularly
- Use HTTPS only
- Monitor API key usage

#### Example Production Setup
```env
# Production Environment Variables
NODE_ENV=production
API_KEY=prod_whatsapp_2025_7k9mN2p4qR6tY8uI1oP3aSd5fG7hJ9kL2nM4q6rT8vW1x3zB5c
CORS_ORIGIN=https://yourdomain.com
```

### 6. Testing API Key Authentication

#### Valid API Key Test
```bash
# Should return 200 OK
curl -H "X-API-Key: your-api-key" http://localhost:3000/api/whatsapp/status
```

#### Invalid API Key Test
```bash
# Should return 401 Unauthorized
curl -H "X-API-Key: invalid-key" http://localhost:3000/api/whatsapp/status
```

#### Missing API Key Test
```bash
# Should return 401 Unauthorized (if API key is required)
curl http://localhost:3000/api/whatsapp/status
```

### 7. Environment-Specific Configuration

#### Development (.env)
```env
# Development - API Key Optional
# API_KEY=dev_simple_key_for_testing

# Or enable for testing
API_KEY=dev_test_key_123456789
```

#### Production (.env.production)
```env
# Production - API Key Required
API_KEY=prod_secure_key_very_long_and_random_string_here
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

### 8. Troubleshooting

#### "API key required" Error
- Check if `API_KEY` is set in `.env`
- Restart the server after changing `.env`
- Verify API key is included in request header or query

#### "Invalid API key" Error
- Check API key value matches exactly
- No extra spaces or characters
- Case-sensitive match required

#### Rate Limiting with API Keys
- Each API key has its own rate limit
- Monitor `X-RateLimit-*` headers
- Consider implementing API key-specific rate limits

### 9. Multiple API Keys (Advanced)

For multiple clients or services, you can implement multiple API keys:

```env
# Multiple API Keys (comma-separated)
API_KEY=key1,key2,key3
```

Or use a more advanced setup with different permissions per key (requires custom implementation).

### 10. Monitoring and Logging

#### Log API Key Usage
```env
LOG_LEVEL=info
```

Check server logs for:
- API key authentication attempts
- Invalid API key usage
- Rate limit violations

#### Security Alerts
Monitor for:
- Repeated invalid API key attempts
- Unusual request patterns
- Rate limit violations

### 11. Migration Guide

#### From No Authentication to API Key
1. Set up API key in `.env`
2. Test endpoints still work without key (backward compatibility)
3. Update all client applications to include API key
4. Remove backward compatibility (optional)

#### Changing API Keys
1. Generate new API key
2. Update `.env` with new key
3. Update all client configurations
4. Restart server
5. Test all integrations

---

**Remember:** 
- Never commit API keys to version control
- Use different API keys for different environments
- Regularly rotate production API keys
- Monitor API key usage and abuse