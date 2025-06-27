const rateLimit = require('express-rate-limit');

// General rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later'
  },
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Rate limiting for certificate operations
const certificateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 certificate operations per minute
  message: {
    success: false,
    error: 'Too many certificate operations, please slow down'
  },
});

// Rate limiting for verification endpoints (more lenient)
const verificationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // limit each IP to 50 verifications per minute
  message: {
    success: false,
    error: 'Too many verification requests, please try again later'
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
  certificateLimiter,
  verificationLimiter
};