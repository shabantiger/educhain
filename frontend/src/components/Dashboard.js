// components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import Login from './Login';
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentCertificates, setRecentCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, certificatesResponse] = await Promise.all([
        api.get('/stats'),
        api.get('/certificates/institution')
      ]);

      setStats(statsResponse.data);
      setRecentCertificates(certificatesResponse.data.certificates.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="alert alert-error">
          {error}
          <button onClick={fetchDashboardData} className="btn btn-sm btn-outline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Welcome back, {user?.name}!</h1>
          <p>Manage your institution's digital certificates</p>
        </div>
        <div className="header-actions">
          <button onClick={fetchDashboardData} className="btn btn-outline mr-2">
            Refresh
          </button>
          <button  
            onClick={() => window.location.href = '/issue'} 
            className="btn btn-primary"
          >
            Issue New Certificate
          </button>
        </div>
      </div>

      {!user?.isVerified && (
        <div className="alert alert-warning">
          <h3>Verification Pending</h3>
          <p>Your institution is pending verification. You'll be able to issue certificates once verified.</p>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎓</div>
          <div className="stat-content">
            <h3>{stats?.totalCertificates || 0}</h3>
            <p>Total Certificates</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats?.activeCertificates || 0}</h3>
            <p>Active Certificates</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <h3>{stats?.revokedCertificates || 0}</h3>
            <p>Revoked Certificates</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats?.certificatesByType?.length || 0}</h3>
            <p>Certificate Types</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-certificates">
          <div className="section-header">
            <h2>Recent Certificates</h2>
            <button 
              onClick={() => window.location.href = '/certificates'}
              className="btn btn-outline"
            >
              View All
            </button>
          </div>
          
          {recentCertificates.length > 0 ? (
            <div className="certificates-list">
              {recentCertificates.map(cert => (
                <div key={cert._id} className="certificate-item">
                  <div className="certificate-info">
                    <h4>{cert.studentName}</h4>
                    <p>{cert.courseName}</p>
                    <span className="certificate-type">{cert.certificateType}</span>
                  </div>
                  <div className="certificate-meta">
                    <span className="token-id">#{cert.tokenId}</span>
                    <span className="issue-date">
                      {new Date(cert.createdAt).toLocaleDateString()}
                    </span>
                    <span className={`status ${cert.isRevoked ? 'revoked' : 'active'}`}>
                      {cert.isRevoked ? 'Revoked' : 'Active'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📜</div>
              <h3>No certificates issued yet</h3>
              <p>Start by issuing your first certificate</p>
              <button 
                onClick={() => window.location.href = '/issue'}
                className="btn btn-primary"
              >
                Issue Certificate
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
                  <span className="type-name">{type._id}</span>
                  <span className="type-count">{type.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Login;