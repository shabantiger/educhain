const { body, validationResult } = require('express-validator');
const { ethers } = require('ethers');

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

const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Institution name must be between 2 and 200 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('walletAddress')
    .custom((value) => {
      if (!ethers.utils.isAddress(value)) {
        throw new Error('Please provide a valid Ethereum address');
      }
      return true;
    }),
  
  body('registrationNumber')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Registration number is required and must not exceed 50 characters'),
  
  body('contactInfo.phone')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('contactInfo.website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid URL'),
  
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

const validateCertificateUpload = [
  body('studentName')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Student name must be between 2 and 200 characters'),
  
  body('studentId')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Student ID is required and must not exceed 50 characters'),
  
  body('studentEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid student email address'),
  
  body('courseName')
    .trim()
    .isLength({ min: 2, max: 300 })
    .withMessage('Course name must be between 2 and 300 characters'),
  
  body('grade')
    .trim()
    .notEmpty()
    .withMessage('Grade is required'),
  
  body('certificateType')
    .isIn(['Certificate', 'Diploma', 'Degree', 'Transcript', 'Award'])
    .withMessage('Invalid certificate type'),
  
  body('graduationDate')
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (value > new Date()) {
        throw new Error('Graduation date cannot be in the future');
      }
      return true;
    }),
  
  handleValidationErrors
];

const validateCertificateIssue = [
  body('studentWalletAddress')
    .custom((value) => {
      if (!ethers.utils.isAddress(value)) {
        throw new Error('Please provide a valid Ethereum address for student wallet');
      }
      return true;
    }),
  
  body('ipfsHash')
    .matches(/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/)
    .withMessage('Please provide a valid IPFS hash'),
  
  ...validateCertificateUpload.slice(0, -1), // Reuse upload validation minus handleValidationErrors
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateCertificateUpload,
  validateCertificateIssue,
  handleValidationErrors
};
