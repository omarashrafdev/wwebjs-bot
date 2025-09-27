const config = require('../config/config');

const apiKeyAuth = (req, res, next) => {
    // Skip authentication if no API key is configured
    if (!config.api.apiKey) {
        return next();
    }

    const apiKey = req.header('X-API-Key') || req.query.apiKey;

    if (!apiKey) {
        return res.status(401).json({
            success: false,
            error: 'API key required',
            message: 'Please provide API key in X-API-Key header or apiKey query parameter'
        });
    }

    if (apiKey !== config.api.apiKey) {
        return res.status(401).json({
            success: false,
            error: 'Invalid API key',
            message: 'The provided API key is invalid'
        });
    }

    next();
};

module.exports = { apiKeyAuth };