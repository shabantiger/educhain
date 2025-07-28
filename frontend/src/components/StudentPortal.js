import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, ABI } from '../constants/contract.js';
// Remove useAuth import since we don't need login

const StudentPortal = () => {
  const [walletCertificates, setWalletCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Only use Web3 context, not Auth
  const { account, connectWallet, isConnected } = useWeb3();

  // Connect wallet and get JWT for student
  const handleWalletConnect = async () => {
    try {
      await connectWallet();
      if (window.ethereum && account) {
        // Call backend to get JWT for student
        const res = await fetch('/api/students/connect-wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: account })
        });
        const data = await res.json();
        if (res.ok && data.token) {
          localStorage.setItem('token', data.token);
          setError('');
        } else {
          setError(data.error || 'Failed to authenticate wallet');
        }
      }
    } catch (err) {
      setError('Wallet connect error: ' + err.message);
    }
  };

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
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        console.log('Fetched certificates:', data);
        if (response.ok) {
          setWalletCertificates(data.certificates || []);
        } else {
          setError(data.message || 'Failed to fetch certificates');
        }
      } catch (jsonErr) {
        console.error('Raw response:', text);
        setError('Failed to parse certificates response: ' + jsonErr.message);
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
            onClick={handleWalletConnect}
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
                <h3>{cert.courseName || cert.course || 'No course'}</h3>
                <p><strong>Student:</strong> {cert.studentName || 'Unknown'}</p>
                <p><strong>Grade:</strong> {cert.grade || 'N/A'}</p>
                <p><strong>Institution:</strong> {cert.institutionName || cert.institution || 'Unknown'}</p>
                <p><strong>Date:</strong> {cert.completionDate ? (typeof cert.completionDate === 'number' ? new Date(cert.completionDate * 1000).toLocaleDateString() : new Date(cert.completionDate).toLocaleDateString()) : 'N/A'}</p>
                <p><strong>Token ID:</strong> {cert.tokenId ? cert.tokenId : 'N/A'}</p>
                <p><strong>Contract Address:</strong> <span style={{fontFamily:'monospace'}} title="Copy this address">0xd2a44c2f0b05fc3b3b348083ad7f542bbad8a226</span></p>
                {cert.ipfsHash && (
                  <a href={`https://gateway.pinata.cloud/ipfs/${cert.ipfsHash}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm">View Certificate</a>
                )}
                {/* Certificate images for visual enhancement */}
                <div style={{display:'flex',gap:'8px',margin:'8px 0'}}>
                  <img src={require('../assets/picture1.png')} alt="Certificate Visual 1" style={{height:'60px',borderRadius:'6px'}} />
                  <img src={require('../assets/picture2.png')} alt="Certificate Visual 2" style={{height:'60px',borderRadius:'6px'}} />
                </div>
                {/* Mint button for certificates not yet minted */}
                {!cert.isMinted && (
                  <button
                    className="btn btn-primary"
                    onClick={async () => {
                      setLoading(true);
                      try {
                        // Mint NFT on-chain using ethers.js
                        if (!window.ethereum) {
                          alert('MetaMask is required!');
                          setLoading(false);
                          return;
                        }
                        const provider = new ethers.providers.Web3Provider(window.ethereum);
                        const signer = provider.getSigner();
                        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
                        // Call issueCertificate on contract
                        const tx = await contract.issueCertificate(
                          cert.studentAddress,
                          cert.studentName,
                          cert.courseName,
                          cert.grade,
                          cert.ipfsHash,
                          Math.floor(new Date(cert.completionDate).getTime() / 1000),
                          cert.certificateType || 'Academic'
                        );
                        const receipt = await tx.wait();
                        // Robustly find CertificateIssued event and get tokenId
                        let tokenId = null;
                        if (receipt.events && receipt.events.length > 0) {
                          for (const event of receipt.events) {
                            if (event.event === 'CertificateIssued' && event.args && event.args.tokenId) {
                              tokenId = event.args.tokenId.toString();
                              break;
                            }
                          }
                        }
                        // Fallback: parse raw logs if event not found
                        if (!tokenId && receipt.logs && receipt.logs.length > 0) {
                          for (const log of receipt.logs) {
                            try {
                              const parsed = contract.interface.parseLog(log);
                              if (parsed.name === 'CertificateIssued' && parsed.args.tokenId) {
                                tokenId = parsed.args.tokenId.toString();
                                break;
                              }
                            } catch (e) {}
                          }
                        }
                        if (!tokenId) {
                          alert('Minted, but tokenId not found in event logs. Please check contract ABI and event signature.');
                          setLoading(false);
                          return;
                        }
                        // Call backend to update DB with tokenId and mark as minted
                        const res = await fetch(`/api/certificates/${cert._id}/onchain-mint`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ tokenId, walletAddress: account })
                        });
                        const data = await res.json();
                        if (res.ok) {
                          alert('Certificate minted to your wallet!');
                          fetchWalletCertificates(account);
                        } else {
                          alert(data.error || 'Minting failed (DB update)');
                        }
                      } catch (err) {
                        alert('Minting error: ' + err.message);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                  >
                    {loading ? 'Minting...' : 'Mint to Wallet'}
                  </button>
                )}
                {cert.isMinted && (
                  <span className="minted-label">Minted</span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default StudentPortal;