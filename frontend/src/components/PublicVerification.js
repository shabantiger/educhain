// components/PublicVerification.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import Login from './Login'

const PublicVerification = () => {
  const [tokenId, setTokenId] = useState('');
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);
  
  const { tokenId: urlTokenId } = useParams();

  useEffect(() => {
    if (urlTokenId) {
      setTokenId(urlTokenId);
      handleVerify(urlTokenId);
    }
  }, [urlTokenId]);

  const handleVerify = async (id = tokenId) => {
    if (!id) {
      setError('Please enter a certificate token ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setCertificate(null);
      setMetadata(null);

      const response = await api.get(`/certificates/verify/${id}`);
      const certData = response.data;

      if (!certData.exists) {
        setError('Certificate not found');
        return;
      }

      setCertificate(certData);

      // Fetch metadata if available
      if (certData.additionalInfo?.ipfsHash) {
        try {
          const metadataResponse = await api.get(`/certificates/metadata/${certData.additionalInfo.ipfsHash}`);
          setMetadata(metadataResponse.data);
        } catch (metadataError) {
          console.warn('Could not fetch metadata:', metadataError);
        }
      }

    } catch (error) {
      console.error('Verification error:', error);
      setError(error.response?.data?.error || 'Failed to verify certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleVerify();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="verification-page">
      <div className="verification-header">
        <h1>Verify Academic Certificate</h1>
        <p>Enter a certificate token ID to verify its authenticity on the blockchain</p>
      </div>

      <div className="verification-form">
        <form onSubmit={handleSubmit} className="verify-form">
          <div className="form-group">
            <label htmlFor="tokenId">Certificate Token ID</label>
            <div className="input-group">
              <input
                type="number"
                id="tokenId"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                placeholder="Enter token ID (e.g., 1234)"
                min="1"
              />
              <button 
                type="submit" 
                disabled={loading || !tokenId}
                className="btn btn-primary"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </div>
        </form>

        <div className="verification-info">
          <h3>How to find Token ID:</h3>
          <ul>
            <li>Check your digital wallet for the NFT certificate</li>
            <li>Look at the certificate document for the token ID</li>
            <li>Ask the issuing institution for the token ID</li>
          </ul>
        </div>
      </div>

      {loading && <LoadingSpinner message="Verifying certificate..." />}

      {error && (
        <div className="verification-result error">
          <div className="result-icon">❌</div>
          <h2>Verification Failed</h2>
          <p>{error}</p>
          <button onClick={() => setError(null)} className="btn btn-outline">
            Try Again
          </button>
        </div>
      )}

      {certificate && (
        <div className={`verification-result ${certificate.isRevoked ? 'revoked' : 'valid'}`}>
          <div className="result-header">
            <div className="result-icon">
              {certificate.isRevoked ? '⚠️' : '✅'}
            </div>
            <h2>
              {certificate.isRevoked ? 'Certificate Revoked' : 'Certificate Verified'}
            </h2>
            <p className="result-subtitle">
              {certificate.isRevoked 
                ? 'This certificate has been revoked and is no longer valid'
                : 'This certificate is authentic and valid'
              }
            </p>
          </div>

          <div className="certificate-details">
            <div className="detail-grid">
              <div className="detail-item">
                <label>Student Name</label>
                <value>{certificate.studentName}</value>
              </div>
              
              <div className="detail-item">
                <label>Course/Program</label>
                <value>{certificate.courseName}</value>
              </div>
              
              <div className="detail-item">
                <label>Institution</label>
                <value>{certificate.institutionName}</value>
              </div>
              
              <div className="detail-item">
                <label>Grade</label>
                <value>{certificate.grade}</value>
              </div>
              
              <div className="detail-item">
                <label>Issue Date</label>
                <value>{formatDate(certificate.issueDate)}</value>
              </div>
              
              <div className="detail-item">
                <label>Graduation Date</label>
                <value>{formatDate(certificate.graduationDate)}</value>
              </div>
              
              <div className="detail-item">
                <label>Token ID</label>
                <value>#{certificate.tokenId}</value>
              </div>
              
              {certificate.additionalInfo && (
                <>
                  <div className="detail-item">
                    <label>Certificate Type</label>
                    <value>{certificate.additionalInfo.certificateType}</value>
                  </div>
                  
                  <div className="detail-item">
                    <label>Transaction Hash</label>
                    <value className="hash">
                      <a 
                        href={`https://basescan.org/tx/${certificate.additionalInfo.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {certificate.additionalInfo.transactionHash.slice(0, 10)}...
                        {certificate.additionalInfo.transactionHash.slice(-8)}
                      </a>
                    </value>
                  </div>
                </>
              )}
            </div>

            {metadata && (
              <div className="certificate-metadata">
                <h3>Certificate Document</h3>
                {metadata.image && (
                  <div className="certificate-image">
                    <img src={metadata.image} alt="Certificate" />
                    <a 
                      href={metadata.image} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-outline"
                    >
                      View Full Size
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="verification-footer">
              <div className="blockchain-info">
                <h4>Blockchain Verification</h4>
                <p>✅ Verified on Base blockchain</p>
                <p>🔒 Tamper-proof and immutable</p>
                <p>🌐 Stored on IPFS</p>
              </div>
              
              <div className="action-buttons">
                <button 
                  onClick={() => window.print()} 
                  className="btn btn-outline"
                >
                  Print Verification
                </button>
                <button 
                  onClick={() => navigator.share?.({
                    title: 'Certificate Verification',
                    text: `Certificate #${certificate.tokenId} verified for ${certificate.studentName}`,
                    url: window.location.href
                  })}
                  className="btn btn-outline"
                >
                  Share Verification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Login;