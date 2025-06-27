const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  tokenId: { 
    type: Number, 
    required: [true, 'Token ID is required'],
    unique: true,
    min: [1, 'Token ID must be positive']
  },
  studentName: { 
    type: String, 
    required: [true, 'Student name is required'],
    trim: true,
    maxlength: [200, 'Student name cannot exceed 200 characters']
  },
  studentId: { 
    type: String, 
    required: [true, 'Student ID is required'],
    trim: true,
    maxlength: [50, 'Student ID cannot exceed 50 characters']
  },
  studentEmail: { 
    type: String, 
    required: [true, 'Student email is required'],
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  courseName: { 
    type: String, 
    required: [true, 'Course name is required'],
    trim: true,
    maxlength: [300, 'Course name cannot exceed 300 characters']
  },
  grade: { 
    type: String, 
    required: [true, 'Grade is required'],
    trim: true
  },
  certificateType: { 
    type: String, 
    required: [true, 'Certificate type is required'],
    enum: ['Certificate', 'Diploma', 'Degree', 'Transcript', 'Award'],
    default: 'Certificate'
  },
  institutionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Institution',
    required: [true, 'Institution ID is required']
  },
  ipfsHash: { 
    type: String, 
    required: [true, 'IPFS hash is required'],
    match: [/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/, 'Please enter a valid IPFS hash']
  },
  transactionHash: { 
    type: String, 
    required: [true, 'Transaction hash is required'],
    match: [/^0x[a-fA-F0-9]{64}$/, 'Please enter a valid transaction hash']
  },
  issueDate: { 
    type: Date, 
    required: [true, 'Issue date is required'],
    default: Date.now
  },
  graduationDate: { 
    type: Date, 
    required: [true, 'Graduation date is required']
  },
  isRevoked: { 
    type: Boolean, 
    default: false 
  },
  revokeReason: {
    type: String,
    trim: true
  },
  revokeDate: {
    type: Date
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

// Compound index for unique certificates per student per course per institution
CertificateSchema.index({ studentId: 1, courseName: 1, institutionId: 1 }, { unique: true });

// Text search index
CertificateSchema.index({ 
  studentName: 'text', 
  studentId: 'text', 
  courseName: 'text' 
});

// Update timestamp on save
CertificateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Certificate', CertificateSchema);
