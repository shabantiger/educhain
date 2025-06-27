// components/Header.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import Login from './Login';
const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { account, connectWallet, disconnectWallet } = useWeb3();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    disconnectWallet();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <span className="logo-icon">🎓</span>
            <span className="logo-text">EDUCHAIN UG</span>
          </Link>

          <nav className="nav">
            <Link to="/verify" className="nav-link">
              Verify Certificate
            </Link>
            <Link to="/student" className="nav-link">
              Student Portal
            </Link>
            
            {isAuthenticated ? (
              <div className="nav-user">
                <div className="user-menu">
                  <button className="user-menu-trigger">
                    <span className="user-name">{user?.name}</span>
                    <span className="user-avatar">🏫</span>
                  </button>
                  <div className="user-menu-dropdown">
                    <Link to="/dashboard" className="dropdown-item">
                      Dashboard
                    </Link>
                    <Link to="/issue" className="dropdown-item">
                      Issue Certificate
                    </Link>
                    <Link to="/certificates" className="dropdown-item">
                      My Certificates
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-item">
                      Logout
                    </button>
                  </div>
                </div>
                
                {account && (
                  <div className="wallet-info">
                    <span className="wallet-address">
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </span>
                    <div className="wallet-status connected">Connected</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="nav-auth">
                <Link to="/login" className="btn btn-outline">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </div>
            )}
          </nav>

          <div className="mobile-menu-toggle">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;