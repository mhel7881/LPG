import { rateLimit } from 'express-rate-limit';
// Rate limiting configurations - more lenient in development
export var generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 1000 : 100, // Much higher limit in dev
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: 15 * 60 // seconds
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: function (req) {
        // Skip rate limiting for development assets
        if (process.env.NODE_ENV === 'development') {
            return req.path.includes('/@fs/') ||
                req.path.includes('/node_modules/') ||
                req.path.includes('.js') ||
                req.path.includes('.css') ||
                req.path.includes('.map') ||
                req.path.includes('/assets/');
        }
        return false;
    }
});
export var authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 authentication attempts per windowMs
    message: {
        error: 'Too many authentication attempts, please try again later.',
        retryAfter: 15 * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
});
export var orderLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // Limit each IP to 10 orders per 5 minutes
    message: {
        error: 'Too many orders placed, please wait before placing another order.',
        retryAfter: 5 * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
});
export var posLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // Limit each IP to 20 POS transactions per minute
    message: {
        error: 'Too many POS transactions, please slow down.',
        retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Security headers middleware
export var securityHeaders = function (req, res, next) {
    // Remove X-Powered-By header
    res.removeHeader('X-Powered-By');
    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    // Content Security Policy
    res.setHeader('Content-Security-Policy', "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self' ws: wss:; " +
        "frame-ancestors 'none';");
    next();
};
// Request sanitization middleware
export var sanitizeInput = function (req, res, next) {
    // Recursively sanitize object properties
    var sanitizeObject = function (obj) {
        if (typeof obj === 'string') {
            // Remove dangerous characters and HTML tags
            return obj
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/<[^>]*>/g, '')
                .trim();
        }
        else if (Array.isArray(obj)) {
            return obj.map(sanitizeObject);
        }
        else if (obj && typeof obj === 'object') {
            var sanitized = {};
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    sanitized[key] = sanitizeObject(obj[key]);
                }
            }
            return sanitized;
        }
        return obj;
    };
    // Sanitize request body
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    // Sanitize query parameters
    if (req.query) {
        req.query = sanitizeObject(req.query);
    }
    next();
};
// Simple CAPTCHA verification (for demo purposes)
export var verifyCaptcha = function (req, res, next) {
    var captcha = req.body.captcha;
    // Skip CAPTCHA for authenticated users or specific routes
    if (req.user || req.path.includes('/api/products')) {
        return next();
    }
    // Simple math CAPTCHA verification
    if (req.method === 'POST' && req.path.includes('/register')) {
        if (!captcha || !captcha.answer || !captcha.expected) {
            return res.status(400).json({
                error: 'CAPTCHA verification required',
                captcha: generateMathCaptcha()
            });
        }
        if (parseInt(captcha.answer) !== parseInt(captcha.expected)) {
            return res.status(400).json({
                error: 'CAPTCHA verification failed',
                captcha: generateMathCaptcha()
            });
        }
    }
    next();
};
// Generate simple math CAPTCHA
export var generateMathCaptcha = function () {
    var a = Math.floor(Math.random() * 10) + 1;
    var b = Math.floor(Math.random() * 10) + 1;
    var operations = ['+', '-', '*'];
    var operation = operations[Math.floor(Math.random() * operations.length)];
    var expected;
    var question;
    switch (operation) {
        case '+':
            expected = a + b;
            question = "".concat(a, " + ").concat(b);
            break;
        case '-':
            expected = Math.max(a, b) - Math.min(a, b);
            question = "".concat(Math.max(a, b), " - ").concat(Math.min(a, b));
            break;
        case '*':
            expected = a * b;
            question = "".concat(a, " \u00D7 ").concat(b);
            break;
        default:
            expected = a + b;
            question = "".concat(a, " + ").concat(b);
    }
    return {
        question: "What is ".concat(question, "?"),
        expected: expected.toString()
    };
};
// IP whitelist for admin actions (in production, use environment variables)
var ADMIN_IP_WHITELIST = [
    '127.0.0.1',
    '::1',
    'localhost'
];
export var adminIPWhitelist = function (req, res, next) {
    var _a, _b;
    // Get the real IP address, considering proxies
    var ip = req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        ((_b = (_a = req.connection) === null || _a === void 0 ? void 0 : _a.socket) === null || _b === void 0 ? void 0 : _b.remoteAddress) ||
        req.headers['x-forwarded-for'] ||
        req.headers['x-real-ip'];
    // In development, allow all IPs
    if (process.env.NODE_ENV === 'development') {
        return next();
    }
    // Check if IP is whitelisted for admin operations
    if (req.path.includes('/admin') && !ADMIN_IP_WHITELIST.includes(ip)) {
        return res.status(403).json({
            error: 'Access denied: IP not authorized for admin operations'
        });
    }
    next();
};
// Request logging middleware
export var requestLogger = function (req, res, next) {
    var start = Date.now();
    var timestamp = new Date().toISOString();
    // Log request
    console.log("[".concat(timestamp, "] ").concat(req.method, " ").concat(req.path, " - IP: ").concat(req.ip));
    // Log response on finish
    res.on('finish', function () {
        var duration = Date.now() - start;
        console.log("[".concat(timestamp, "] ").concat(req.method, " ").concat(req.path, " - ").concat(res.statusCode, " - ").concat(duration, "ms"));
    });
    next();
};
// File upload security (if implementing file uploads later)
export var fileUploadSecurity = {
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
        files: 1 // Max 1 file per request
    },
    allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf'
    ],
    sanitizeFilename: function (filename) {
        return filename
            .replace(/[^a-zA-Z0-9\-_\.]/g, '')
            .substring(0, 100); // Limit filename length
    }
};
