const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const InstitutionSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Institution name is required'],
    trim: true,
    maxlength: [200, 'Institution name cannot exceed 200 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  walletAddress: { 
    type: String, 
    required: [true, 'Wallet address is required'],
    unique: true,
    lowercase: true,
    match: [/^0x[a-fA-F0-9]{40}$/, 'Please enter a valid Ethereum address']
  },
  registrationNumber: { 
    type: String, 
    required: [true, 'Registration number is required'],
    unique: true,
    trim: true
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  contactInfo: {
    phone: {
      type: String,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
    },
    address: {
      type: String,
      maxlength: [500, 'Address cannot exceed 500 characters']
    },
    website: {
      type: String,
      match: [/^https?:\/\/.+/, 'Please enter a valid URL']
    }
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Hash password before saving
InstitutionSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
InstitutionSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update timestamp on save
InstitutionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Institution', InstitutionSchema);
