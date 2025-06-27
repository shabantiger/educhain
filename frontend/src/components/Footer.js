// components/Footer.js
import React from 'react';
import './Footer.css';
import Login from './Login';
const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>EDUCHAIN UG</h3>
            <p>Revolutionizing academic credentials in Uganda through blockchain technology.</p>
            <div className="social-links">
              <a href="#" aria-label="Twitter">🐦</a>
              <a href="#" aria-label="LinkedIn">💼</a>
              <a href="#" aria-label="GitHub">⚡</a>
            </div>
          </div>
          
          <div className="footer-section">
            <h4>For Institutions</h4>
            <ul>
              <li><a href="/register">Register</a></li>
              <li><a href="/login">Login</a></li>
              <li><a href="/dashboard">Dashboard</a></li>
              <li><a href="/issue">Issue Certificates</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>For Students</h4>
            <ul>
              <li><a href="/student">Student Portal</a></li>
              <li><a href="/verify">Verify Certificate</a></li>
              <li><a href="#wallet-guide">Wallet Setup</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Resources</h4>
            <ul>
              <li><a href="#docs">Documentation</a></li>
              <li><a href="#api">API Guide</a></li>
              <li><a href="#support">Support</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-legal">
            <p>&copy; 2025 EDUCHAIN UG. All rights reserved.</p>
            <div className="legal-links">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
            </div>
          </div>
          
          <div className="footer-tech">
            <p>Built on <strong>Base</strong> blockchain</p>
            <p>Powered by <strong>IPFS</strong></p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
