const crypto = require('crypto');
const { ethers } = require('ethers');

/**
 * Generate a secure random string
 */
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Hash a string using SHA256
 */
const hashString = (string) => {
  return crypto.createHash('sha256').update(string).digest('hex');
};

/**
 * Validate Ethereum address
 */
const isValidEthereumAddress = (address) => {
  return ethers.utils.isAddress(address);
};

/**
 * Format Ethereum address for display
 */
const formatAddress = (address, startLength = 6, endLength = 4) => {
  if (!address) return '';
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

/**
 * Format file size in human readable format
 */
const formatFileSize = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Validate email address
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize filename for safe storage
 */
const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
};

/**
 * Generate certificate ID
 */
const generateCertificateId = (studentId, courseName, institutionId) => {
  const combined = `${studentId}-${courseName}-${institutionId}`;
  return hashString(combined);
};

/**
 * Validate IPFS hash
 */
const isValidIPFSHash = (hash) => {
  const ipfsRegex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
  return ipfsRegex.test(hash);
};

/**
 * Format date for display
 */
const formatDate = (date, locale = 'en-UG') => {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Calculate age from date
 */
const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Validate phone number (international format)
 */
const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

/**
 * Generate QR code data for certificate
 */
const generateQRCodeData = (tokenId) => {
  return `${process.env.FRONTEND_URL}/verify/${tokenId}`;
};

/**
 * Paginate array
 */
const paginate = (array, page, limit) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  return {
    data: array.slice(startIndex, endIndex),
    currentPage: page,
    totalPages: Math.ceil(array.length / limit),
    totalItems: array.length,
    hasNext: endIndex < array.length,
    hasPrev: startIndex > 0
  };
};

/**
 * Sleep function for delays
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry function with exponential backoff
 */
const retry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    
    await sleep(delay);
    return retry(fn, retries - 1, delay * 2);
  }
};

/**
 * Deep clone object
 */
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Remove sensitive data from object
 */
const sanitizeUser = (user) => {
  const sanitized = { ...user };
  delete sanitized.password;
  delete sanitized.__v;
  return sanitized;
};

/**
 * Generate certificate serial number
 */
const generateSerialNumber = (institutionCode, year, sequence) => {
  const paddedSequence = String(sequence).padStart(4, '0');
  return `${institutionCode}-${year}-${paddedSequence}`;
};

/**
 * Validate URL
 */
const isValidURL = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

module.exports = {
  generateRandomString,
  hashString,
  isValidEthereumAddress,
  formatAddress,
  formatFileSize,
  isValidEmail,
  sanitizeFilename,
  generateCertificateId,
  isValidIPFSHash,
  formatDate,
  calculateAge,
  isValidPhoneNumber,
  generateQRCodeData,
  paginate,
  sleep,
  retry,
  deepClone,
  sanitizeUser,
  generateSerialNumber,
  isValidURL
};
