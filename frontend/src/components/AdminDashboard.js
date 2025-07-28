import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    status: 'approved',
    comments: ''
  });

  useEffect(() => {
    fetchAdminData();
    // eslint-disable-next-line
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [verificationResponse, revenueResponse] = await Promise.all([
        api.get('/admin/verification-requests', {
          headers: { 'admin-email': 'admin@educhain.com' }
        }).catch(err => {
          console.error('Failed to fetch verification requests:', err);
          return { data: { verificationRequests: [] } };
        }),
        api.get('/admin/revenue', {
          headers: { 'admin-email': 'admin@educhain.com' }
        }).catch(err => {
          console.error('Failed to fetch revenue data:', err);
          return { data: null };
        })
      ]);

      setVerificationRequests(verificationResponse.data.verificationRequests || []);
      setRevenueData(revenueResponse.data);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      setVerificationRequests([]); // Defensive: set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    try {
      setLoading(true);
      // Use verificationRequestId for review endpoint
      await api.post(`/admin/verification-requests/${selectedRequest.verificationRequestId}/review`, reviewData, {
        headers: { 'admin-email': 'admin@educhain.com' }
      });

      setReviewModal(false);
      setSelectedRequest(null);
      setReviewData({ status: 'approved', comments: '' });
      
      // Refresh data
      await fetchAdminData();
      
      alert('Verification request reviewed successfully!');
    } catch (error) {
      console.error('Review error:', error);
      alert('Failed to review request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (request) => {
    setSelectedRequest(request);
    setReviewModal(true);
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-spinner">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      {revenueData && (
        <div className="revenue-analytics">
          <h3>Revenue Analytics</h3>
          <p><b>Total Revenue:</b> ${revenueData.totalRevenue?.toFixed(2) || '0.00'}</p>
          <p><b>Active Subscriptions:</b> {revenueData.activeSubscriptions || 0}</p>
          <div className="plan-breakdown">
            <h4>Subscriptions by Plan:</h4>
            <ul>
              {revenueData.planBreakdown && Object.entries(revenueData.planBreakdown).map(([plan, count]) => (
                <li key={plan}><b>{plan.charAt(0).toUpperCase() + plan.slice(1)}:</b> {count}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Verification Requests */}
      <div className="verification-section">
        <h2>Verification Requests ({verificationRequests.length})</h2>
        {verificationRequests.length === 0 ? (
          <div className="no-requests">No pending verification requests</div>
        ) : (
          <div className="requests-list">
            {verificationRequests.map((request) => (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <h3>{request.institutionName}</h3>
                  <span className={`status ${request.status}`}>{request.status}</span>
                </div>
                <div className="request-details">
                  <p><strong>Email:</strong> {request.institutionEmail}</p>
                  <p><strong>Registration Number:</strong> {request.registrationNumber}</p>
                  <p><strong>Submitted:</strong> {new Date(request.submittedAt).toLocaleDateString()}</p>
                </div>
                <div className="documents-list">
                  <h4>Documents:</h4>
                  {request.documents.map((doc, idx) => (
                    <div key={idx} className="document-item">
                      <span>{doc.type}: </span>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">{doc.originalName || 'View Document'}</a>
                      <p className="document-description">{doc.description}</p>
                    </div>
                  ))}
                </div>
                {request.status === 'pending' && (
                  <div className="request-actions">
                    <button 
                      className="btn btn-primary" 
                      onClick={() => openReviewModal(request)}
                    >
                      Review Request
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="verification-stats">
          <div className="stat-item">
            <span className="stat-label">Pending:</span>
            <span className="stat-value">
              {(Array.isArray(verificationRequests) ? verificationRequests : []).filter(req => req.status === 'pending').length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Approved:</span>
            <span className="stat-value">
              {(Array.isArray(verificationRequests) ? verificationRequests : []).filter(req => req.status === 'approved').length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Rejected:</span>
            <span className="stat-value">
              {(Array.isArray(verificationRequests) ? verificationRequests : []).filter(req => req.status === 'rejected').length}
            </span>
          </div>
        </div>

        <div className="requests-list">
          {(Array.isArray(verificationRequests) ? verificationRequests : []).map(request => (
            <div key={request.id} className="request-card">
              <div className="request-header">
                <h3>{request.institutionName}</h3>
                <span className={`status-badge ${request.status}`}>
                  {request.status}
                </span>
              </div>
              
              <div className="request-details">
                <p><strong>Email:</strong> {request.institutionEmail}</p>
                <p><strong>Registration:</strong> {request.registrationNumber}</p>
                <p><strong>Submitted:</strong> {new Date(request.submittedAt).toLocaleDateString()}</p>
                
                {request.documents && request.documents.length > 0 && (
                  <div className="documents">
                    <strong>Documents:</strong>
                    <ul>
                      {request.documents.map((doc, index) => (
                        <li key={index}>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            {doc.description}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {request.reviewedAt && (
                  <div className="review-info">
                    <p><strong>Reviewed:</strong> {new Date(request.reviewedAt).toLocaleDateString()}</p>
                    <p><strong>By:</strong> {request.reviewedBy}</p>
                    {request.comments && <p><strong>Comments:</strong> {request.comments}</p>}
                  </div>
                )}
              </div>

              {request.status === 'pending' && (
                <div className="request-actions">
                  <button 
                    className="btn-review"
                    onClick={() => openReviewModal(request)}
                  >
                    Review Request
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && selectedRequest && (
        <div className="modal-overlay">
          <div className="review-modal">
            <div className="modal-header">
              <h3>Review Verification Request</h3>
              <button 
                className="modal-close"
                onClick={() => setReviewModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="institution-info">
                <h4>{selectedRequest.institutionName}</h4>
                <p>Email: {selectedRequest.institutionEmail}</p>
                <p>Registration: {selectedRequest.registrationNumber}</p>
              </div>

              <div className="review-form">
                <div className="form-group">
                  <label>Decision:</label>
                  <select 
                    value={reviewData.status}
                    onChange={(e) => setReviewData({...reviewData, status: e.target.value})}
                  >
                    <option value="approved">Approve</option>
                    <option value="rejected">Reject</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Comments:</label>
                  <textarea
                    value={reviewData.comments}
                    onChange={(e) => setReviewData({...reviewData, comments: e.target.value})}
                    placeholder="Add review comments..."
                    rows="4"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  className="btn-cancel"
                  onClick={() => setReviewModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-confirm"
                  onClick={handleReview}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Submit Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;