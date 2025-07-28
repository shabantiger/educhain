// components/IssueCertificate.js
import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import api from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import { ethers } from 'ethers';
import Login from './Login';
import { createCertificate } from '../services/api';

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
    }
  };

  const handleIssue = async () => {
    if (!certificateFile) {
      setErrors(prev => ({ ...prev, file: 'Please select a certificate file' }));
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const data = new FormData();
      data.append('certificateFile', certificateFile);
      
      // Map frontend field names to backend expected field names
      data.append('studentAddress', formData.studentWalletAddress);
      data.append('studentName', formData.studentName);
      data.append('courseName', formData.courseName);
      data.append('grade', formData.grade);
      data.append('completionDate', formData.graduationDate);
      data.append('certificateType', formData.certificateType);
      data.append('studentId', formData.studentId);
      data.append('studentEmail', formData.studentEmail);

      // Debug logging
      console.log('Sending certificate data:', {
        studentAddress: formData.studentWalletAddress,
        studentName: formData.studentName,
        courseName: formData.courseName,
        grade: formData.grade,
        completionDate: formData.graduationDate,
        certificateType: formData.certificateType,
        studentId: formData.studentId,
        studentEmail: formData.studentEmail,
        file: certificateFile.name
      });

      const response = await api.post('/certificates/issue', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Certificate issued successfully:', response.data);
      setIssueResult(response.data.certificate);
      setStep(3); // Success step
    } catch (error) {
      console.error("Failed to issue certificate:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      let errorMessage = 'Failed to issue certificate';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. Your institution may not be verified.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data.error || 'Invalid request data';
      }
      
      setErrors(prev => ({ ...prev, issue: errorMessage }));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setIssueResult(null);
    setErrors({});
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      {step === 3 && issueResult && (
        <div className="alert alert-success">
          <h3>Certificate Issued Successfully! 🎉</h3>
          <p><strong>Student:</strong> {issueResult.studentName}</p>
          <p><strong>Course:</strong> {issueResult.courseName}</p>
          <p><strong>IPFS Hash:</strong> {issueResult.ipfsHash}</p>
          <p><strong>Contract Address:</strong> <span style={{fontFamily:'monospace'}}>{issueResult.contractAddress || '0xd2a44c2f0b05fc3b3b348083ad7f542bbad8a226'}</span></p>
          <div style={{marginTop:'1em',color:'orange'}}>
            <b>Next Step:</b> The student must log in to the <b>Student Portal</b> and click <b>"Mint to Wallet"</b> to mint this certificate as an NFT on-chain.<br/>
            The NFT will then be visible in their wallet and on the Sepolia explorer.
          </div>
          <button onClick={resetForm} className="btn btn-primary" style={{marginTop:'1em'}}>
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
                onClick={handleIssue}
                disabled={!certificateFile || loading}
                className="btn btn-primary"
              >
                {loading ? 'Issuing...' : 'Issue Certificate'}
              </button>
            </div>
          </div>
        )}

        {errors.issue && (
          <div className="alert alert-danger" style={{ marginTop: '1rem' }}>
            {errors.issue}
          </div>
        )}
      </div>
    </div>
  );
};
export default IssueCertificate;
