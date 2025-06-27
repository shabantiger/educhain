// components/IssueCertificate.js
import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import api from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import { ethers } from 'ethers';
import Login from './Login';

const IssueCertificate = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    studentId: '',
    studentEmail: '',
    studentWalletAddress: '',
    courseName: '',
    grade: '',
    certificateType: 'Certificate',
    graduationDate: '',
  });
  const [certificateFile, setCertificateFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: Upload, 3: Issue
  const [uploadResult, setUploadResult] = useState(null);
  const [issueResult, setIssueResult] = useState(null);
  const [errors, setErrors] = useState({});
  
  const fileInputRef = useRef(null);
  const { user } = useAuth();
  const { isConnected, isConnectedToBase, switchToBaseNetwork } = useWeb3();

  const certificateTypes = [
    'Certificate',
    'Diploma', 
    'Degree',
    'Transcript',
    'Award'
  ];

  const grades = [
    'First Class',
    'Second Class Upper',
    'Second Class Lower', 
    'Pass',
    'A',
    'B+',
    'B',
    'C+',
    'C',
    'D+',
    'D',
    'F'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          file: 'Only JPEG, PNG, and PDF files are allowed'
        }));
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          file: 'File size must be less than 10MB'
        }));
        return;
      }

      setCertificateFile(file);
      setErrors(prev => ({
        ...prev,
        file: ''
      }));

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.studentName.trim()) {
      newErrors.studentName = 'Student name is required';
    }

    if (!formData.studentId.trim()) {
      newErrors.studentId = 'Student ID is required';
    }

    if (!formData.studentEmail.trim()) {
      newErrors.studentEmail = 'Student email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.studentEmail)) {
      newErrors.studentEmail = 'Invalid email format';
    }

    if (!formData.studentWalletAddress.trim()) {
      newErrors.studentWalletAddress = 'Student wallet address is required';
    } else if (!ethers.utils.isAddress(formData.studentWalletAddress)) {
      newErrors.studentWalletAddress = 'Invalid wallet address';
    }

    if (!formData.courseName.trim()) {
      newErrors.courseName = 'Course name is required';
    }

    if (!formData.grade) {
      newErrors.grade = 'Grade is required';
    }

    if (!formData.graduationDate) {
      newErrors.graduationDate = 'Graduation date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateForm()) {
      setStep(2);
    } else if (step === 2 && certificateFile) {
      handleUpload();
    }
  };

  const handleUpload = async () => {
    if (!certificateFile) {
      setErrors(prev => ({ ...prev, file: 'Please select a certificate file' }));
      return;
    }

    try {
      setLoading(true);
      const uploadFormData = new FormData();
      uploadFormData.append('certificate', certificateFile);
      
      // Add form data
      Object.keys(formData).forEach(key => {
        uploadFormData.append(key, formData[key]);
      });

      const response = await api.post('/certificates/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadResult(response.data);
      setStep(3);
    } catch (error) {
      console.error('Upload error:', error);
      setErrors(prev => ({
        ...prev,
        upload: error.response?.data?.error || 'Failed to upload certificate'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleIssue = async () => {
    if (!uploadResult) {
      setErrors(prev => ({ ...prev, issue: 'Please upload certificate first' }));
      return;
    }

    if (!isConnected) {
      setErrors(prev => ({ ...prev, wallet: 'Please connect your wallet' }));
      return;
    }

    if (!isConnectedToBase()) {
      try {
        await switchToBaseNetwork();
      } catch (error) {
        setErrors(prev => ({ ...prev, network: 'Please switch to Base network' }));
        return;
      }
    }

    try {
      setLoading(true);
      
      const issueData = {
        ...formData,
        ipfsHash: uploadResult.ipfsHash
      };

      const response = await api.post('/certificates/issue', issueData);
      setIssueResult(response.data);
      
      // Clear form for next certificate
      setFormData({
        studentName: '',
        studentId: '',
        studentEmail: '',
        studentWalletAddress: '',
        courseName: '',
        grade: '',
        certificateType: 'Certificate',
        graduationDate: '',
      });
      setCertificateFile(null);
      setPreview(null);
      setUploadResult(null);
      setStep(1);
      
    } catch (error) {
      console.error('Issue error:', error);
      setErrors(prev => ({
        ...prev,
        issue: error.response?.data?.error || 'Failed to issue certificate'
      }));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setUploadResult(null);
    setIssueResult(null);
    setErrors({});
  };

  if (!user?.isVerified) {
    return (
      <div className="certificate-issue">
        <div className="alert alert-warning">
          <h3>Institution Verification Required</h3>
          <p>Your institution must be verified before you can issue certificates. Please contact support for verification.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="certificate-issue">
      <div className="page-header">
        <h1>Issue Certificate</h1>
        <p>Create and mint a new academic certificate as an NFT</p>
      </div>

      {/* Step Indicator */}
      <div className="step-indicator">
        <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <span className="step-number">1</span>
          <span className="step-title">Certificate Details</span>
        </div>
        <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
          <span className="step-number">2</span>
          <span className="step-title">Upload Document</span>
        </div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>
          <span className="step-number">3</span>
          <span className="step-title">Issue on Blockchain</span>
        </div>
      </div>

      {/* Success Message */}
      {issueResult && (
        <div className="alert alert-success">
          <h3>Certificate Issued Successfully! 🎉</h3>
          <p>Token ID: #{issueResult.tokenId}</p>
          <p>Transaction Hash: {issueResult.transactionHash}</p>
          <button onClick={() => setIssueResult(null)} className="btn btn-primary">
            Issue Another Certificate
          </button>
        </div>
      )}

      <div className="certificate-form">
        {/* Step 1: Certificate Details */}
        {step === 1 && (
          <div className="form-step">
            <h2>Certificate Details</h2>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="studentName">Student Full Name *</label>
                <input
                  type="text"
                  id="studentName"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  className={errors.studentName ? 'error' : ''}
                  placeholder="Enter student's full name"
                />
                {errors.studentName && <span className="error-text">{errors.studentName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="studentId">Student ID *</label>
                <input
                  type="text"
                  id="studentId"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  className={errors.studentId ? 'error' : ''}
                  placeholder="Enter student ID"
                />
                {errors.studentId && <span className="error-text">{errors.studentId}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="studentEmail">Student Email *</label>
                <input
                  type="email"
                  id="studentEmail"
                  name="studentEmail"
                  value={formData.studentEmail}
                  onChange={handleInputChange}
                  className={errors.studentEmail ? 'error' : ''}
                  placeholder="student@example.com"
                />
                {errors.studentEmail && <span className="error-text">{errors.studentEmail}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="studentWalletAddress">Student Wallet Address *</label>
                <input
                  type="text"
                  id="studentWalletAddress"
                  name="studentWalletAddress"
                  value={formData.studentWalletAddress}
                  onChange={handleInputChange}
                  className={errors.studentWalletAddress ? 'error' : ''}
                  placeholder="0x..."
                />
                {errors.studentWalletAddress && <span className="error-text">{errors.studentWalletAddress}</span>}
                <small className="form-help">The certificate NFT will be minted to this address</small>
              </div>

              <div className="form-group">
                <label htmlFor="courseName">Course/Program Name *</label>
                <input
                  type="text"
                  id="courseName"
                  name="courseName"
                  value={formData.courseName}
                  onChange={handleInputChange}
                  className={errors.courseName ? 'error' : ''}
                  placeholder="e.g., Bachelor of Computer Science"
                />
                {errors.courseName && <span className="error-text">{errors.courseName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="certificateType">Certificate Type *</label>
                <select
                  id="certificateType"
                  name="certificateType"
                  value={formData.certificateType}
                  onChange={handleInputChange}
                >
                  {certificateTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="grade">Grade/Classification *</label>
                <select
                  id="grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  className={errors.grade ? 'error' : ''}
                >
                  <option value="">Select Grade</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
                {errors.grade && <span className="error-text">{errors.grade}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="graduationDate">Graduation Date *</label>
                <input
                  type="date"
                  id="graduationDate"
                  name="graduationDate"
                  value={formData.graduationDate}
                  onChange={handleInputChange}
                  className={errors.graduationDate ? 'error' : ''}
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.graduationDate && <span className="error-text">{errors.graduationDate}</span>}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={handleNext} className="btn btn-primary">
                Next: Upload Certificate
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Upload Certificate */}
        {step === 2 && (
          <div className="form-step">
            <h2>Upload Certificate Document</h2>
            
            <div className="upload-section">
              <div className="file-upload" onClick={() => fileInputRef.current?.click()}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  style={{ display: 'none' }}
                />
                
                {certificateFile ? (
                  <div className="file-selected">
                    <div className="file-info">
                      <span className="file-name">{certificateFile.name}</span>
                      <span className="file-size">
                        {(certificateFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    {preview && (
                      <div className="file-preview">
                        <img src={preview} alt="Certificate preview" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <div className="upload-icon">📄</div>
                    <h3>Upload Certificate</h3>
                    <p>Drag and drop or click to select</p>
                    <small>Supports: JPEG, PNG, PDF (Max 10MB)</small>
                  </div>
                )}
              </div>
              
              {errors.file && <span className="error-text">{errors.file}</span>}
              {errors.upload && <span className="error-text">{errors.upload}</span>}
            </div>

            <div className="certificate-preview">
              <h3>Certificate Summary</h3>
              <div className="preview-card">
                <div className="preview-header">
                  <h4>{user?.name}</h4>
                  <span className="certificate-type">{formData.certificateType}</span>
                </div>
                <div className="preview-content">
                  <p><strong>Student:</strong> {formData.studentName}</p>
                  <p><strong>Student ID:</strong> {formData.studentId}</p>
                  <p><strong>Course:</strong> {formData.courseName}</p>
                  <p><strong>Grade:</strong> {formData.grade}</p>
                  <p><strong>Graduation Date:</strong> {formData.graduationDate}</p>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setStep(1)} className="btn btn-outline">
                Back
              </button>
              <button 
                type="button" 
                onClick={handleNext} 
                disabled={!certificateFile || loading}
                className="btn btn-primary"
              >
                {loading ? 'Uploading...' : 'Upload to IPFS'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Issue on Blockchain */}
        {step === 3 && uploadResult && (
          <div className="form-step">
            <h2>Issue Certificate on Blockchain</h2>
            
            <div className="blockchain-info">
              <div className="info-card success">
                <h3>✅ Upload Successful</h3>
                <p><strong>IPFS Hash:</strong> {uploadResult.ipfsHash}</p>
                <p><strong>File Hash:</strong> {uploadResult.fileHash}</p>
                <a 
                  href={`https://gateway.pinata.cloud/ipfs/${uploadResult.fileHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  View on IPFS
                </a>
              </div>

              <div className="blockchain-requirements">
                <h3>Blockchain Requirements</h3>
                <div className={`requirement ${isConnected ? 'met' : 'unmet'}`}>
                  <span className="requirement-icon">{isConnected ? '✅' : '❌'}</span>
                  <span>Wallet Connected</span>
                  {!isConnected && (
                    <button onClick={() => window.location.reload()} className="btn btn-sm btn-outline">
                      Connect Wallet
                    </button>
                  )}
                </div>
                <div className={`requirement ${isConnectedToBase() ? 'met' : 'unmet'}`}>
                  <span className="requirement-icon">{isConnectedToBase() ? '✅' : '❌'}</span>
                  <span>Connected to Base Network</span>
                  {!isConnectedToBase() && (
                    <button onClick={switchToBaseNetwork} className="btn btn-sm btn-outline">
                      Switch Network
                    </button>
                  )}
                </div>
              </div>

              {errors.wallet && <div className="alert alert-error">{errors.wallet}</div>}
              {errors.network && <div className="alert alert-error">{errors.network}</div>}
              {errors.issue && <div className="alert alert-error">{errors.issue}</div>}
            </div>

            <div className="form-actions">
              <button type="button" onClick={resetForm} className="btn btn-outline">
                Start Over
              </button>
              <button 
                type="button" 
                onClick={handleIssue}
                disabled={!isConnected || !isConnectedToBase() || loading}
                className="btn btn-primary"
              >
                {loading ? 'Issuing Certificate...' : 'Issue Certificate NFT'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Login;