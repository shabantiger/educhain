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
            <img src={require('../assets/logo.png')} alt="EduChain Logo" style={{height:'40px',marginRight:'10px'}} />
            <span className="logo-text">EDUCHAIN HOME</span>
          </Link>

          <nav className="nav">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="nav-link btn btn-outline">
                  Dashboard
                </Link>
                <Link to="/issue" className="nav-link btn btn-outline">
                  Issue Certificate
                </Link>
                <Link to="/certificates" className="nav-link btn btn-outline">
                  My Certificates
                </Link>
                <div className="nav-user">
                  <div className="user-menu">
                    <button className="user-menu-trigger btn btn-secondary">
                      <span className="user-name">{user?.name}</span>
                      <span className="user-avatar">🏫</span>
                    </button>
                    <div className="user-menu-dropdown">
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
              </>
            ) : (
              <>
                <Link to="/verify" className="nav-link btn btn-outline">
                  Verify Certificate
                </Link>
                <Link to="/student" className="nav-link btn btn-outline">
                  Student Portal
                </Link>
                <Link to="/subscription" className="nav-link btn btn-outline">
                  Subscription
                </Link>
                <Link to="/admin-login" className="nav-link btn btn-outline">
                  Admin Login
                </Link>
                <div className="nav-auth">
                  <Link to="/login" className="btn btn-outline">
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-primary">
                    Register
                  </Link>
                </div>
              </>
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