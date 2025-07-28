// components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import './Dashboard.css';
import VerificationDocuments from './VerificationDocuments';
import SubscriptionPlans from './SubscriptionPlans';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentCertificates, setRecentCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [usageWarning, setUsageWarning] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all data in parallel
        const [statsResponse, certificatesResponse, subscriptionResponse, usageResponse] = await Promise.allSettled([
          api.get('/stats'),
          api.get('/certificates/institution'),
          api.get('/subscription/current'),
          api.get('/subscription/usage')
        ]);

        // Handle stats and certificates
        if (statsResponse.status === 'fulfilled') {
          setStats(statsResponse.value.data);
        }
        
        if (certificatesResponse.status === 'fulfilled') {
          setRecentCertificates(certificatesResponse.value.data.certificates.slice(0, 5));
        }

        // Handle subscription
        if (subscriptionResponse.status === 'fulfilled') {
          setSubscription(subscriptionResponse.value.data.subscription);
        } else {
          setSubscription(null);
        }

        // Handle usage
        if (usageResponse.status === 'fulfilled') {
          const usageData = usageResponse.value.data.usage;
          setUsage(usageData);
          
          // Warn if near or over limit
          if (usageData && usageData.certificatesIssued !== undefined && usageData.certificatesLimit > 0) {
            const percent = usageData.certificatesIssued / usageData.certificatesLimit;
            if (percent >= 1) {
              setUsageWarning('You have reached your certificate issuance limit for this period. Please upgrade your plan.');
            } else if (percent >= 0.8) {
              setUsageWarning('You are nearing your certificate issuance limit. Consider upgrading your plan.');
            } else {
              setUsageWarning('');
            }
          }
        } else {
          setUsage(null);
          setUsageWarning('');
        }

        setDataLoaded(true);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  const refreshDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsResponse, certificatesResponse] = await Promise.all([
        api.get('/stats'),
        api.get('/certificates/institution')
      ]);

      setStats(statsResponse.data);
      setRecentCertificates(certificatesResponse.data.certificates.slice(0, 5));
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
      setError('Failed to refresh dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner only during initial load
  if (loading && !dataLoaded) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-card">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button onClick={refreshDashboard} className="btn-retry">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <h2 style={{ textAlign: 'center' }}>Choose a Subscription Plan to Get Started</h2>
        <div style={{ width: '100%', maxWidth: 700 }}>
          <SubscriptionPlans user={user} onPlanChange={() => window.location.reload()} />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Cover Image Section */}
      <div style={{width:'100%',maxHeight:'220px',marginBottom:'16px'}}>
        <img src={require('../assets/cover.png')} alt="EduChain Cover" style={{width:'100%',maxHeight:'220px',objectFit:'cover',borderRadius:'12px'}} />
      </div>
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <div className="welcome-avatar">
            <span>{user?.name?.charAt(0) || 'I'}</span>
          </div>
          <div className="welcome-text">
            <h1>Welcome back, {user?.name}!</h1>
            <p>Here's what's happening with your certificates today</p>
          </div>
        </div>
        <div className="header-actions">
          <button 
            onClick={refreshDashboard} 
            className="btn-secondary"
            disabled={loading}
          >
            <span className="icon">🔄</span>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button 
            onClick={() => window.location.href = '/issue'} 
            className="btn-primary"
            disabled={!user?.isVerified}
          >
            <span className="icon">➕</span>
            Issue Certificate
          </button>
        </div>
      </div>

      {/* Verification Alert and Document Upload */}
      {!user?.isVerified && (
        <div className="verification-alert">
          <VerificationDocuments user={user} onStatusChange={refreshDashboard} />
        </div>
      )}

      {subscription && (
        <div className="subscription-summary">
          <h4>Current Plan: {subscription.planId.charAt(0).toUpperCase() + subscription.planId.slice(1)}</h4>
          <p>Status: <b>{subscription.status}</b></p>
          <p>Valid until: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p>
        </div>
      )}
      {usage && (
        <div className="usage-summary">
          <p>Certificates issued this period: <b>{usage.certificatesIssued}</b> / <b>{usage.certificatesLimit === -1 ? 'Unlimited' : usage.certificatesLimit}</b></p>
        </div>
      )}
      {usageWarning && <div className="alert alert-warning">{usageWarning}</div>}

      {/* Navigation Tabs and Panels */}
      {user?.isVerified && (
        <>
          {/* Navigation Tabs */}
          <div className="dashboard-tabs">
            <button 
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab ${activeTab === 'certificates' ? 'active' : ''}`}
              onClick={() => setActiveTab('certificates')}
            >
              Certificates
            </button>
            <button 
              className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
          </div>
          {/* Certificate Panels */}
          <div className="dashboard-panels">
            {activeTab === 'overview' && (
              <div className="overview-section">
                <div className="recent-certificates">
                  <div className="section-header">
                    <h2>Recent Certificates</h2>
                    <button 
                      onClick={() => window.location.href = '/certificates'}
                      className="btn-outline"
                    >
                      View All
                    </button>
                  </div>
                  
                  {recentCertificates.length > 0 ? (
                    <div className="certificates-grid">
                      {recentCertificates.map(cert => (
                        <div key={cert._id} className="certificate-card">
                          <div className="certificate-header">
                            <div className="certificate-icon">🎓</div>
                            <div className="certificate-status">
                              <span className={`status-badge ${cert.isRevoked ? 'revoked' : 'active'}`}>
                                {cert.isRevoked ? 'Revoked' : 'Active'}
                              </span>
                            </div>
                          </div>
                          <div className="certificate-content">
                            <h4>{cert.studentName}</h4>
                            <p className="course-name">{cert.courseName}</p>
                            <span className="certificate-type">{cert.certificateType}</span>
                          </div>
                          <div className="certificate-footer">
                            <span className="token-id">#{cert.tokenId}</span>
                            <span className="issue-date">
                              {new Date(cert.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">📜</div>
                      <h3>No certificates issued yet</h3>
                      <p>Start by issuing your first certificate to students</p>
                      <button 
                        onClick={() => window.location.href = '/issue'}
                        className="btn-primary"
                        disabled={!user?.isVerified}
                      >
                        Issue Your First Certificate
                      </button>
                    </div>
                  )}
                </div>

                {stats?.certificatesByType && stats.certificatesByType.length > 0 && (
                  <div className="certificate-types">
                    <h2>Certificates by Type</h2>
                    <div className="types-chart">
                      {stats.certificatesByType.map(type => (
                        <div key={type._id} className="type-item">
                          <div className="type-info">
                            <span className="type-name">{type._id}</span>
                            <span className="type-count">{type.count}</span>
                          </div>
                          <div className="type-progress">
                            <div 
                              className="progress-bar" 
                              style={{width: `${(type.count / stats.totalCertificates) * 100}%`}}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'certificates' && (
              <div className="certificates-section">
                <h2>All Certificates</h2>
                <p>Manage and view all your issued certificates</p>
                {/* Certificate management interface will go here */}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="analytics-section">
                <h2>Analytics</h2>
                <p>Detailed insights about your certificate issuance</p>
                {/* Analytics charts will go here */}
              </div>
            )}
          </div>
        </>
      )}
      {/* If not verified, show only verification section (already handled above) */}
    </div>
  );
};

export default Dashboard;
