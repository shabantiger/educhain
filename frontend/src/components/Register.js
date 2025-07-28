// components/Register.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import LoadingSpinner from './LoadingSpinner';
import SubscriptionPlans from './SubscriptionPlans';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    walletAddress: '',
    registrationNumber: '',
    contactInfo: {
      phone: '',
      address: '',
      website: ''
    }
  });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [showPlans, setShowPlans] = useState(true);
  
  const { register, loading, error } = useAuth();
  const { account, connectWallet } = useWeb3();
  const navigate = useNavigate();

  useEffect(() => {
    if (account) {
      setFormData(prev => ({
        ...prev,
        walletAddress: account
      }));
    }
  }, [account]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    // Validate required fields in step 1
    if (!formData.name.trim()) {
      newErrors.name = 'Institution name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = 'Registration number is required';
    }
    
    // Optional fields validation
    if (formData.contactInfo.phone.trim() && !/^\+?[\d\s\-\(\)]+$/.test(formData.contactInfo.phone.trim())) {
      newErrors['contactInfo.phone'] = 'Please enter a valid phone number';
    }
    
    if (formData.contactInfo.website.trim() && !/^https?:\/\/.+/.test(formData.contactInfo.website.trim())) {
      newErrors['contactInfo.website'] = 'Please enter a valid website URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.walletAddress) {
      newErrors.walletAddress = 'Wallet address is required';
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.walletAddress)) {
      newErrors.walletAddress = 'Please enter a valid Ethereum wallet address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }

    const registrationData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      walletAddress: formData.walletAddress,
      registrationNumber: formData.registrationNumber,
      contactInfo: formData.contactInfo
    };

    const result = await register(registrationData);
    
    if (result.success) {
      navigate('/login', { 
        state: { 
          message: 'Registration successful! Please login to continue. Your institution will be verified shortly.' 
        }
      });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Register Institution</h2>
          <p>Join the blockchain certificate revolution</p>
          <div className="step-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
         {step === 1 && (
  <>
    <div className="form-group">
      <label htmlFor="name">Institution Name *</label>
      <input
        type="text"
        id="name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        className={errors.name ? 'error' : ''}
        placeholder="University/College Name"
        required
      />
      {errors.name && <span className="error-text">{errors.name}</span>}
    </div>

    <div className="form-group">
      <label htmlFor="email">Email Address *</label>
      <input
        type="email"
        id="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        className={errors.email ? 'error' : ''}
        placeholder="admin@institution.edu"
        required
      />
      {errors.email && <span className="error-text">{errors.email}</span>}
    </div>

    <div className="form-group">
      <label htmlFor="registrationNumber">Registration Number *</label>
      <input
        type="text"
        id="registrationNumber"
        name="registrationNumber"
        value={formData.registrationNumber}
        onChange={handleChange}
        className={errors.registrationNumber ? 'error' : ''}
        placeholder="Official registration number"
        required
      />
      {errors.registrationNumber && <span className="error-text">{errors.registrationNumber}</span>}
    </div>

    <div className="form-group">
      <label htmlFor="contactInfo.phone">Phone Number</label>
      <input
        type="tel"
        id="contactInfo.phone"
        name="contactInfo.phone"
        value={formData.contactInfo.phone}
        onChange={handleChange}
        placeholder="+256 XXX XXX XXX"
      />
    </div>

    <div className="form-group">
      <label htmlFor="contactInfo.address">Physical Address</label>
      <textarea
        id="contactInfo.address"
        name="contactInfo.address"
        value={formData.contactInfo.address}
        onChange={handleChange}
        placeholder="Institution address"
        rows="3"
      />
    </div>

    <div className="form-group">
      <label htmlFor="contactInfo.website">Website (Optional)</label>
      <input
        type="url"
        id="contactInfo.website"
        name="contactInfo.website"
        value={formData.contactInfo.website}
        onChange={handleChange}
        placeholder="https://www.institution.ac.ug"
      />
    </div>

    <button type="button" onClick={handleNext} className="btn btn-primary btn-full">
      Next Step
    </button>
  </>
)}

          {step === 2 && (
            <>
              <div className="form-group">
                <label htmlFor="password">Create Password *</label>
                <div className="password-input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? 'error' : ''}
                    placeholder="Minimum 8 characters"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'error' : ''}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="walletAddress">Ethereum Wallet Address *</label>
                <div className="wallet-input">
                  <input
                    type="text"
                    id="walletAddress"
                    name="walletAddress"
                    value={formData.walletAddress}
                    onChange={handleChange}
                    className={errors.walletAddress ? 'error' : ''}
                    placeholder="0x..."
                    readOnly={!!account}
                  />
                  {!account && (
                    <button
                      type="button"
                      onClick={connectWallet}
                      className="btn btn-outline btn-sm"
                    >
                      Connect Wallet
                    </button>
                  )}
                </div>
                {errors.walletAddress && <span className="error-text">{errors.walletAddress}</span>}
                <small className="form-help">
                  This wallet will be used to issue and manage certificates on the blockchain
                </small>
              </div>

              <div className="form-actions" style={{ justifyContent: 'center' }}>
                <button type="button" onClick={handleBack} className="btn btn-outline">
                  Back
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </>
          )}
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default Register;