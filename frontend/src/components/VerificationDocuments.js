import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const VerificationDocuments = ({ user, onStatusChange }) => {
  const [documents, setDocuments] = useState([]);
  const [fileInputs, setFileInputs] = useState([{ type: '', file: null, description: '' }]);
  const [status, setStatus] = useState(user?.verificationStatus || 'pending');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVerificationStatus();
    // eslint-disable-next-line
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      setLoading(true);
      const res = await api.get('/institutions/verification-status');
      setStatus(res.data.verificationStatus);
      setDocuments(res.data.verificationRequest?.documents || []);
      if (onStatusChange) onStatusChange(res.data.verificationStatus);
    } catch (err) {
      setError('Failed to fetch verification status');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (idx, field, value) => {
    const updated = [...fileInputs];
    updated[idx][field] = value;
    setFileInputs(updated);
  };

  const handleFileChange = (idx, file) => {
    const updated = [...fileInputs];
    updated[idx].file = file;
    setFileInputs(updated);
  };

  const addFileInput = () => {
    setFileInputs([...fileInputs, { type: '', file: null, description: '' }]);
  };

  const removeFileInput = (idx) => {
    setFileInputs(fileInputs.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const formData = new FormData();
      
      const validInputs = fileInputs.filter(f => f.file && f.type);
      
      if (validInputs.length === 0) {
        setError('Please add at least one document');
        setLoading(false);
        return;
      }

      validInputs.forEach((input, index) => {
        formData.append('documents', input.file);
        formData.append(`type${index}`, input.type);
        formData.append(`description${index}`, input.description || '');
      });

      const res = await api.post('/institutions/verification-documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setMessage('Documents submitted successfully!');
      setStatus('pending');
      setDocuments(res.data.documents || []);
      if (onStatusChange) onStatusChange('pending');
      
      setFileInputs([{ type: '', file: null, description: '' }]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit documents');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verification-documents">
      <h2>Institution Verification</h2>
      {loading && <LoadingSpinner message="Processing..." />}
      {status === 'approved' ? (
        <div className="alert alert-success">Your institution is verified!</div>
      ) : (
        <>
          <div className={`alert alert-${status === 'rejected' ? 'danger' : 'warning'}`}>Verification status: <b>{status}</b></div>
          {status === 'rejected' && <div className="alert alert-danger">Your previous submission was rejected. Please resubmit your documents.</div>}
          <form onSubmit={handleSubmit} className="verification-form">
            {fileInputs.map((input, idx) => (
              <div key={idx} className="file-input-row">
                <select
                  value={input.type}
                  onChange={e => handleInputChange(idx, 'type', e.target.value)}
                  required
                >
                  <option value="">Select document type</option>
                  <option value="registration_certificate">Registration Certificate</option>
                  <option value="accreditation">Accreditation</option>
                  <option value="government_recognition">Government Recognition</option>
                  <option value="business_license">Business License</option>
                  <option value="other">Other</option>
                </select>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={e => handleFileChange(idx, e.target.files[0])}
                  required
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={input.description}
                  onChange={e => handleInputChange(idx, 'description', e.target.value)}
                  required
                />
                {fileInputs.length > 1 && (
                  <button type="button" onClick={() => removeFileInput(idx)} className="btn btn-danger">Remove</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addFileInput} className="btn btn-secondary">Add Another Document</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>Submit Documents</button>
          </form>
          {error && <div className="alert alert-danger">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}
        </>
      )}
      {documents && documents.length > 0 && (
        <div className="submitted-documents">
          <h4>Submitted Documents</h4>
          <ul>
            {documents.map((doc, idx) => (
              <li key={idx}>
                <b>{doc.type}</b>: <a href={doc.url} target="_blank" rel="noopener noreferrer">{doc.description}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default VerificationDocuments;