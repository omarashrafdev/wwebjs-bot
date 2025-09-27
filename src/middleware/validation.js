const { body, query, validationResult } = require('express-validator');

// Validation rules
const messageValidation = [
    body('number')
        .notEmpty()
        .withMessage('Phone number is required')
        .isString()
        .withMessage('Phone number must be a string')
        .matches(/^\+?[1-9]\d{1,14}$/)
        .withMessage('Invalid phone number format'),
    
    body('message')
        .notEmpty()
        .withMessage('Message is required')
        .isString()
        .withMessage('Message must be a string')
        .isLength({ min: 1, max: 4096 })
        .withMessage('Message must be between 1 and 4096 characters')
];

const bulkMessageValidation = [
    body('contacts')
        .isArray({ min: 1 })
        .withMessage('Contacts must be a non-empty array'),
    
    body('contacts.*.number')
        .notEmpty()
        .withMessage('Each contact must have a phone number')
        .matches(/^\+?[1-9]\d{1,14}$/)
        .withMessage('Invalid phone number format'),
    
    body('contacts.*.name')
        .optional()
        .isString()
        .withMessage('Contact name must be a string'),
    
    body('message')
        .notEmpty()
        .withMessage('Message is required')
        .isString()
        .withMessage('Message must be a string')
        .isLength({ min: 1, max: 4096 })
        .withMessage('Message must be between 1 and 4096 characters'),
    
    body('options.delay')
        .optional()
        .isInt({ min: 1000, max: 30000 })
        .withMessage('Delay must be between 1000 and 30000 milliseconds')
];

// Validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors.array()
        });
    }
    
    next();
};

module.exports = {
    messageValidation,
    bulkMessageValidation,
    handleValidationErrors
};