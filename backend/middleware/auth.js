const jwt = require('jsonwebtoken');
const { Institution } = require('../models');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify institution still exists and is active
    const institution = await Institution.findById(decoded.institutionId).select('-password');
    if (!institution) {
      return res.status(401).json({
        success: false,
        error: 'Institution not found'
      });
    }

    req.user = {
      institutionId: decoded.institutionId,
      walletAddress: decoded.walletAddress,
      name: decoded.name,
      isVerified: institution.isVerified
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

const requireVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      error: 'Institution must be verified to perform this action'
    });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  // For now, admin is determined by environment variable
  // In production, you'd have a proper admin system
  const adminWallets = process.env.ADMIN_WALLETS ? process.env.ADMIN_WALLETS.split(',') : [];
  
  if (!adminWallets.includes(req.user.walletAddress.toLowerCase())) {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireVerified,
  requireAdmin
};