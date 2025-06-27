import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
// Remove useAuth import since we don't need login

const StudentPortal = () => {
  const [walletCertificates, setWalletCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Only use Web3 context, not Auth
  const { account, connectWallet, isConnected } = useWeb3();

  // Fetch certificates when wallet connects
  useEffect(() => {
    if (account) {
      fetchWalletCertificates(account);
    }
  }, [account]);

  const fetchWalletCertificates = async (walletAddress) => {
    try {
      setLoading(true);
      setError('');
      
      // Call your smart contract or API to get certificates for this wallet
      const response = await fetch(`/api/certificates/wallet/${walletAddress}`);
      const data = await response.json();
      
      if (response.ok) {
        setWalletCertificates(data.certificates || []);
      } else {
        setError(data.message || 'Failed to fetch certificates');
      }
    } catch (err) {
      setError('Error fetching certificates: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // If no wallet connected, show connection prompt
  if (!isConnected || !account) {
    return (
      <div className="student-portal">
        <div className="wallet-connect-prompt">
          <h2>Student Certificate Portal</h2>
          <p>Connect your wallet to view your certificates</p>
          <button 
            onClick={connectWallet}
            className="btn btn-primary"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  // Main portal content when wallet is connected
  return (
    <div className="student-portal">
      <div className="portal-header">
        <h2>My Certificates</h2>
        <p>Wallet: {account}</p>
        <button 
          onClick={() => fetchWalletCertificates(account)}
          className="btn btn-outline"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'load certificate'}
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading certificates...</div>
      ) : (
        <div className="certificates-grid">
          {walletCertificates.length === 0 ? (
            <div className="no-certificates">
              <p>No certificates found for this wallet address.</p>
            </div>
          ) : (
            walletCertificates.map((cert, index) => (
              <div key={index} className="certificate-card">
                <h3>{cert.courseName}</h3>
                <p><strong>Student:</strong> {cert.studentName}</p>
                <p><strong>Grade:</strong> {cert.grade}</p>
                <p><strong>Institution:</strong> {cert.institution}</p>
                <p><strong>Date:</strong> {new Date(cert.completionDate * 1000).toLocaleDateString()}</p>
                <button className="btn btn-sm">View Certificate</button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default StudentPortal;