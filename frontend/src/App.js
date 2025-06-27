// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ethers } from 'ethers';
import './App.css';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import IssueCertificate from './components/IssueCertificate';
import VerifyCertificate from './components/VerifyCertificate';
import Login from './components/Login';
import Register from './components/Register';
import StudentPortal from './components/StudentPortal';
import PublicVerification from './components/PublicVerification';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Web3Provider, useWeb3 } from './contexts/Web3Context';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Web3Provider>
          <Router>
            <div className="App">
              <Header />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/verify" element={<PublicVerification />} />
                  <Route path="/verify/:tokenId" element={<PublicVerification />} />
                  <Route path="/student" element={<StudentPortal />} />
                  
                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/issue" element={
                    <ProtectedRoute>
                      <IssueCertificate />
                    </ProtectedRoute>
                  } />
                  <Route path="/certificates" element={
                    <ProtectedRoute>
                      <VerifyCertificate />
                    </ProtectedRoute>
                  } />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </Web3Provider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

// Home Page Component
const HomePage = () => {
  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Secure Academic Certificates on Blockchain</h1>
          <p>
            Issue, store, and verify academic certificates using NFTs on the Base blockchain.
            Prevent fraud, ensure authenticity, and give students full ownership of their credentials.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={() => window.location.href = '/register'}>
              Register Institution
            </button>
            <button className="btn btn-secondary" onClick={() => window.location.href = '/verify'}>
              Verify Certificate
            </button>
          </div>
        </div>
        <div className="hero-image">
          <div className="certificate-mockup">
            <div className="certificate-header">
              <h3>Academic Certificate</h3>
              <div className="blockchain-badge">⛓️ Blockchain Verified</div>
            </div>
            <div className="certificate-body">
              <p>This certifies that</p>
              <h2>SEKIZIYIVU PAUL</h2>
              <p>has successfully completed</p>
              <h3>Bachelor of Computer Science</h3>
              <p>with Grade: First Class</p>
            </div>
            <div className="certificate-footer">
              <div className="qr-code">📱</div>
              <div className="nft-info">
                <small>NFT Token ID: #1234</small>
                <small>IPFS Hash: Qm...</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2>Why Choose Blockchain Certificates?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Tamper-Proof</h3>
              <p>Certificates stored on blockchain cannot be altered or forged</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Instant Verification</h3>
              <p>Verify certificates in seconds without contacting institutions</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👤</div>
              <h3>Student Ownership</h3>
              <p>Students own their certificates as NFTs in their digital wallets</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3>Global Access</h3>
              <p>Access certificates from anywhere in the world, 24/7</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Cost Effective</h3>
              <p>Reduce administrative costs and eliminate paper certificates</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🇺🇬</div>
              <h3>Built for Uganda</h3>
              <p>Addressing local challenges with fake transcripts and slow verification</p>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>0</h3>
              <p>Certificates Issued</p>
            </div>
            <div className="stat-card">
              <h3>0</h3>
              <p>Verified Institutions</p>
            </div>
            <div className="stat-card">
              <h3>100%</h3>
              <p>Fraud Prevention</p>
            </div>
            <div className="stat-card">
              <h3>⚡</h3>
              <p>Instant Verification</p>
            </div>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <div className="container">
          <h2>Ready to Modernize Your Certificates?</h2>
          <p>Join the digital transformation of academic credentials in Uganda</p>
          <div className="cta-buttons">
            <button className="btn btn-primary" onClick={() => window.location.href = '/register'}>
              Get Started
            </button>
            <button className="btn btn-outline" onClick={() => window.location.href = '/verify'}>
              Try Verification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default App;