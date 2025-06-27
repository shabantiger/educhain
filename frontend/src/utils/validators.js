import { VALIDATION_RULES } from './constants';

/**
 * Validate institution registration form
 */
export const validateRegistration = (formData) => {
  const errors = {};

  // Name validation
  if (!formData.name || formData.name.trim().length < 2) {
    errors.name = 'Institution name must be at least 2 characters';
  }

  // Email validation
  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!VALIDATION_RULES.EMAIL.test(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Password validation
  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
    errors.password = 'Password must contain uppercase, lowercase, and number';
  }

  // Confirm password validation
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  // Wallet address validation
  if (!formData.walletAddress) {
    errors.walletAddress = 'Wallet address is required';
  } else if (!VALIDATION_RULES.ETHEREUM_ADDRESS.test(formData.walletAddress)) {
    errors.walletAddress = 'Please enter a valid Ethereum address';
  }

  // Registration number validation
  if (!formData.registrationNumber || formData.registrationNumber.trim().length === 0) {
    errors.registrationNumber = 'Registration number is required';
  }

  // Phone validation (optional)
  if (formData.contactInfo?.phone && !VALIDATION_RULES.PHONE.test(formData.contactInfo.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  // Website validation (optional)
  if (formData.contactInfo?.website) {
    try {
      new URL(formData.contactInfo.website);
    } catch {
      errors.website = 'Please enter a valid URL';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate login form
 */
export const validateLogin = (formData) => {
  const errors = {};

  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!VALIDATION_RULES.EMAIL.test(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!formData.password) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate certificate form
 */
export const validateCertificate = (formData) => {
  const errors = {};

  // Student name validation
  if (!formData.studentName || formData.studentName.trim().length < 2) {
    errors.studentName = 'Student name must be at least 2 characters';
  }

  // Student ID validation
  if (!formData.studentId || formData.studentId.trim().length === 0) {
    errors.studentId = 'Student ID is required';
  }

  // Student email validation
  if (!formData.studentEmail) {
    errors.studentEmail = 'Student email is required';
  } else if (!VALIDATION_RULES.EMAIL.test(formData.studentEmail)) {
    errors.studentEmail = 'Please enter a valid email address';
  }

  // Student wallet address validation
  if (!formData.studentWalletAddress) {
    errors.studentWalletAddress = 'Student wallet address is required';
  } else if (!VALIDATION_RULES.ETHEREUM_ADDRESS.test(formData.studentWalletAddress)) {
    errors.studentWalletAddress = 'Please enter a valid Ethereum address';
  }

  // Course name validation
  if (!formData.courseName || formData.courseName.trim().length < 2) {
    errors.courseName = 'Course name must be at least 2 characters';
  }

  // Grade validation
  if (!formData.grade) {
    errors.grade = 'Grade is required';
  }

  // Certificate type validation
  const validTypes = ['Certificate', 'Diploma', 'Degree', 'Transcript', 'Award'];
  if (!formData.certificateType || !validTypes.includes(formData.certificateType)) {
    errors.certificateType = 'Please select a valid certificate type';
  }

  // Graduation date validation
  if (!formData.graduationDate) {
    errors.graduationDate = 'Graduation date is required';
  } else {
    const gradDate = new Date(formData.graduationDate);
    const today = new Date();
    if (gradDate > today) {
      errors.graduationDate = 'Graduation date cannot be in the future';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate file upload
 */
export const validateFileUpload = (file) => {
  const errors = {};

  if (!file) {
    errors.file = 'File is required';
    return { isValid: false, errors };
  }

  // File type validation
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    errors.file = 'Only JPEG, PNG, and PDF files are allowed';
  }

  // File size validation (10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.file = 'File size must be less than 10MB';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate search query
 */
export const validateSearchQuery = (query) => {
  const errors = {};

  if (!query || query.trim().length === 0) {
    errors.query = 'Search query is required';
  } else if (query.trim().length < 2) {
    errors.query = 'Search query must be at least 2 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate token ID
 */
export const validateTokenId = (tokenId) => {
  const errors = {};

  if (!tokenId) {
    errors.tokenId = 'Token ID is required';
  } else if (!/^\d+$/.test(tokenId) || parseInt(tokenId) <= 0) {
    errors.tokenId = 'Token ID must be a positive number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
