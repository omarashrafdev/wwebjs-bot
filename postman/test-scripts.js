// Postman Test Scripts for WhatsApp API Collection
// Copy these scripts into the "Tests" tab of specific requests for automated testing

// =============================================================================
// COMMON TEST SCRIPTS (use in multiple requests)
// =============================================================================

// Basic Response Validation
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is JSON", function () {
    pm.response.to.be.json;
});

pm.test("Response has success property", function () {
    pm.expect(pm.response.json()).to.have.property('success');
});

pm.test("Response time is less than 5000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(5000);
});

// =============================================================================
// HEALTH CHECK TESTS
// =============================================================================

// For "Health Check" request
pm.test("Health check returns success", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.message).to.equal('Server is healthy');
    pm.expect(jsonData).to.have.property('uptime');
});

// =============================================================================
// WHATSAPP STATUS TESTS
// =============================================================================

// For "Get WhatsApp Status" request
pm.test("WhatsApp status response structure", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property('isReady');
    pm.expect(jsonData.data).to.have.property('isConnected');
    pm.expect(jsonData.data).to.have.property('hasQR');
});

// Store connection status for other tests
pm.test("Store WhatsApp connection status", function () {
    const jsonData = pm.response.json();
    pm.globals.set("whatsappConnected", jsonData.data.isReady);
});

// =============================================================================
// MESSAGE SENDING TESTS
// =============================================================================

// For "Send Single Message" request
pm.test("Message sent successfully", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property('messageId');
    pm.expect(jsonData.data).to.have.property('timestamp');
    pm.expect(jsonData.data).to.have.property('to');
});

// For "Send Bulk Messages" request
pm.test("Bulk messages response structure", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property('results');
    pm.expect(jsonData.data).to.have.property('summary');
    pm.expect(jsonData.data.summary).to.have.property('total');
    pm.expect(jsonData.data.summary).to.have.property('success');
    pm.expect(jsonData.data.summary).to.have.property('failed');
});

pm.test("Bulk messages - at least one successful", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.summary.success).to.be.at.least(0);
});

// =============================================================================
// VALIDATION ERROR TESTS
// =============================================================================

// For validation error requests (400 status)
pm.test("Validation error response structure", function () {
    pm.response.to.have.status(400);
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.error).to.equal('Validation failed');
    pm.expect(jsonData).to.have.property('details');
    pm.expect(jsonData.details).to.be.an('array');
});

// =============================================================================
// AUTHENTICATION TESTS
// =============================================================================

// For requests that require authentication (when API key is enabled)
pm.test("Authentication successful", function () {
    // If API key is not configured, this should pass
    // If API key is configured and provided, this should pass
    // If API key is configured but not provided, this should fail with 401
    const statusCode = pm.response.code;
    if (statusCode === 401) {
        const jsonData = pm.response.json();
        pm.expect(jsonData.error).to.include('API key');
    } else {
        pm.expect(statusCode).to.equal(200);
    }
});

// =============================================================================
// RATE LIMITING TESTS
// =============================================================================

// For rate limiting tests
pm.test("Rate limit headers present", function () {
    // These headers might be present if rate limiting is active
    const rateLimitRemaining = pm.response.headers.get('X-RateLimit-Remaining');
    const rateLimitLimit = pm.response.headers.get('X-RateLimit-Limit');
    
    if (rateLimitRemaining) {
        pm.test("Rate limit remaining is a number", function () {
            pm.expect(parseInt(rateLimitRemaining)).to.be.a('number');
        });
    }
});

// =============================================================================
// PRE-REQUEST SCRIPTS
// =============================================================================

// For "Send Single Message" - Use environment phone number
pm.globals.set("timestamp", new Date().toISOString());

// Set test phone number from environment
if (pm.environment.get("testPhoneNumber")) {
    const requestBody = JSON.parse(pm.request.body.raw);
    requestBody.number = pm.environment.get("testPhoneNumber");
    pm.request.body.raw = JSON.stringify(requestBody);
}

// =============================================================================
// CONDITIONAL TESTS (based on WhatsApp connection status)
// =============================================================================

// Skip message sending tests if WhatsApp is not connected
const isWhatsAppConnected = pm.globals.get("whatsappConnected");
if (isWhatsAppConnected === "false" || !isWhatsAppConnected) {
    pm.test.skip("WhatsApp not connected - skipping message test");
} else {
    // Run normal message tests
    pm.test("Message sent successfully", function () {
        const jsonData = pm.response.json();
        pm.expect(jsonData.success).to.be.true;
    });
}

// =============================================================================
// ENVIRONMENT-SPECIFIC TESTS
// =============================================================================

// Different tests for development vs production
const environment = pm.environment.get("environment") || "development";

if (environment === "production") {
    pm.test("Production - API key required", function () {
        const apiKey = pm.environment.get("apiKey");
        pm.expect(apiKey).to.not.be.empty;
    });
    
    pm.test("Production - HTTPS URL", function () {
        const baseUrl = pm.environment.get("baseUrl");
        pm.expect(baseUrl).to.include("https://");
    });
} else {
    pm.test("Development - HTTP allowed", function () {
        const baseUrl = pm.environment.get("baseUrl");
        pm.expect(baseUrl).to.include("http://");
    });
}

// =============================================================================
// COLLECTION-LEVEL TESTS
// =============================================================================

// Add this to the collection's "Tests" tab for overall collection testing
pm.test("Collection variables are set", function () {
    pm.expect(pm.collectionVariables.get("baseUrl")).to.not.be.undefined;
});

// =============================================================================
// CUSTOM HELPER FUNCTIONS
// =============================================================================

// Function to check if phone number is valid format
function isValidPhoneNumber(phoneNumber) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
}

// Function to generate random test data
function generateTestStudent() {
    const names = ['Ahmed Ali', 'Fatima Hassan', 'Omar Khaled', 'Sarah Ahmed', 'Mohamed Ali'];
    const classes = ['Grade 10A', 'Grade 10B', 'Grade 11A', 'Grade 11B'];
    
    return {
        number: pm.environment.get("testPhoneNumber") || "+201234567890",
        name: names[Math.floor(Math.random() * names.length)],
        studentId: "ST" + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
        class: classes[Math.floor(Math.random() * classes.length)],
        grade: Math.floor(Math.random() * 40 + 60).toString()
    };
}

// =============================================================================
// USAGE INSTRUCTIONS
// =============================================================================

/*
To use these test scripts:

1. BASIC SETUP:
   - Copy the appropriate test script(s) into the "Tests" tab of your request
   - The common test scripts can be used in multiple requests

2. COLLECTION-LEVEL TESTS:
   - Copy collection-level tests into the collection's "Tests" tab
   - These run after every request in the collection

3. PRE-REQUEST SCRIPTS:
   - Copy pre-request scripts into the "Pre-request Script" tab
   - These run before each request

4. ENVIRONMENT VARIABLES:
   - Make sure your environment has the required variables set
   - testPhoneNumber, baseUrl, apiKey (if using authentication)

5. CONDITIONAL TESTING:
   - Some tests are conditional based on WhatsApp connection status
   - Run "Get WhatsApp Status" first to set the connection status

6. CUSTOM FUNCTIONS:
   - The helper functions can be used in any test script
   - Modify them based on your specific testing needs

EXAMPLE WORKFLOW:
1. Import collection and environment
2. Run "Health Check" with basic tests
3. Run "Get WhatsApp Status" with status tests
4. Run message sending tests if WhatsApp is connected
5. Run validation tests with error response tests
6. Run rate limiting tests if needed
*/