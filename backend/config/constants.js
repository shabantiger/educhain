module.exports = {
  // Application constants
  APP_NAME: 'EDUCHAIN Uganda',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'Blockchain-based academic certificate system for Uganda',

  // Certificate types
  CERTIFICATE_TYPES: [
    'Certificate',
    'Diploma',
    'Degree',
    'Transcript',
    'Award'
  ],

  // Grade options
  GRADE_OPTIONS: [
    'First Class',
    'Second Class Upper',
    'Second Class Lower',
    'Pass',
    'A+', 'A', 'A-',
    'B+', 'B', 'B-',
    'C+', 'C', 'C-',
    'D+', 'D', 'D-',
    'F'
  ],

  // File upload limits
  FILE_LIMITS: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.pdf']
  },

  // Pagination defaults
  PAGINATION: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    DEFAULT_PAGE: 1
  },

  // Rate limiting
  RATE_LIMITS: {
    GENERAL: 100, // requests per 15 minutes
    AUTH: 5,      // requests per 15 minutes
    CERTIFICATE: 10, // requests per minute
    VERIFICATION: 50 // requests per minute
  },

  // JWT settings
  JWT: {
    EXPIRES_IN: '24h',
    ALGORITHM: 'HS256'
  },

  // Email settings
  EMAIL: {
    FROM_NAME: 'EDUCHAIN Uganda',
    FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@EDUCHAIN.ug'
  },

  // Blockchain settings
  BLOCKCHAIN: {
    CONFIRMATION_BLOCKS: 3,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000 // milliseconds
  },

  // IPFS settings
  IPFS: {
    GATEWAY: 'https://gateway.pinata.cloud/ipfs/',
    TIMEOUT: 30000 // 30 seconds
  },

  // Status codes
  STATUS_CODES: {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    RATE_LIMITED: 429,
    SERVER_ERROR: 500
  },

  // Error messages
  ERROR_MESSAGES: {
    INVALID_TOKEN: 'Invalid or expired token',
    INSTITUTION_NOT_FOUND: 'Institution not found',
    CERTIFICATE_NOT_FOUND: 'Certificate not found',
    UNAUTHORIZED: 'Unauthorized access',
    VALIDATION_ERROR: 'Validation failed',
    SERVER_ERROR: 'Internal server error',
    FILE_TOO_LARGE: 'File size too large',
    INVALID_FILE_TYPE: 'Invalid file type',
    DUPLICATE_ENTRY: 'Duplicate entry',
    INSTITUTION_NOT_VERIFIED: 'Institution not verified'
  },

  // Success messages
  SUCCESS_MESSAGES: {
    REGISTRATION_SUCCESS: 'Institution registered successfully',
    LOGIN_SUCCESS: 'Login successful',
    CERTIFICATE_ISSUED: 'Certificate issued successfully',
    CERTIFICATE_REVOKED: 'Certificate revoked successfully',
    PROFILE_UPDATED: 'Profile updated successfully',
    VERIFICATION_SUCCESS: 'Institution verified successfully'
  },

  // Uganda specific data
  UGANDA: {
    TIMEZONE: 'Africa/Kampala',
    CURRENCY: 'UGX',
    PHONE_CODE: '+256',
    UNIVERSITIES: [
      'Makerere University',
      'Kampala International University',
      'Uganda Christian University',
      'Kyambogo University',
      'Mbarara University of Science and Technology',
      'Gulu University',
      'Busitema University'
    ]
  },

  // API endpoints
  API_ENDPOINTS: {
    AUTH: '/api/auth',
    INSTITUTIONS: '/api/institutions',
    CERTIFICATES: '/api/certificates',
    HEALTH: '/api/health'
  },

  // Frontend routes
  FRONTEND_ROUTES: {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    ISSUE: '/issue',
    VERIFY: '/verify',
    STUDENT: '/student'
  }
};