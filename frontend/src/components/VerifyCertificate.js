// components/VerifyCertificate.js (Institution view)
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import Login from './Login';
const VerifyCertificate = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [revokeModal, setRevokeModal] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/certificates/institution');
      setCertificates(response.data.certificates);
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
      setError(error.response?.data?.error || 'Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const filteredCertificates = useMemo(() => {
    let filtered = [...certificates];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(cert =>
        cert.studentName.toLowerCase().includes(term) ||
        cert.studentId.toLowerCase().includes(term) ||
        cert.courseName.toLowerCase().includes(term) ||
        cert.tokenId.toString().includes(term)
      );
    }

    if (filterType !== 'all') {
      if (filterType === 'active') {
        filtered = filtered.filter(cert => !cert.isRevoked);
      } else if (filterType === 'revoked') {
        filtered = filtered.filter(cert => cert.isRevoked);
      } else {
        filtered = filtered.filter(cert => cert.certificateType === filterType);
      }
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'student':
          return a.studentName.localeCompare(b.studentName);
        case 'course':
          return a.courseName.localeCompare(b.courseName);
        default:
          return 0;
      }
    });

    return filtered;
  }, [certificates, searchTerm, filterType, sortBy]);

  const handleRevoke = async () => {
    if (!selectedCertificate || !revokeReason.trim()) return;

    try {
      setLoading(true);
      await api.post(`/certificates/revoke/${selectedCertificate.tokenId}`, {
        reason: revokeReason
      });

      setCertificates(prev =>
        prev.map(cert =>
          cert.tokenId === selectedCertificate.tokenId
            ? { ...cert, isRevoked: true }
            : cert
        )
      );

      setRevokeModal(false);
      setSelectedCertificate(null);
      setRevokeReason('');
    } catch (error) {
      console.error('Failed to revoke certificate:', error);
      setError(error.response?.data?.error || 'Failed to revoke certificate');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

  if (loading && certificates.length === 0) {
    return <LoadingSpinner message="Loading certificates..." />;
  }

  return (
    <div className="certificates-page">
      <div className="page-header">
        <h1>Certificate Management</h1>
        <p>View and manage all certificates issued by your institution</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError(null)} className="btn btn-sm btn-outline">
            Dismiss
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="controls-section">
        <div className="search-controls">
          <input
            type="text"
            placeholder="Search by student name, ID, course, or token ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
            <option value="all">All Certificates</option>
            <option value="active">Active Only</option>
            <option value="revoked">Revoked Only</option>
            <option value="Certificate">Certificates</option>
            <option value="Diploma">Diplomas</option>
            <option value="Degree">Degrees</option>
            <option value="Transcript">Transcripts</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="student">Student Name</option>
            <option value="course">Course Name</option>
          </select>
        </div>
      </div>

      <div className="results-summary">
        <p>Showing {filteredCertificates.length} of {certificates.length} certificates</p>
      </div>

      {/* Certificate List */}
      {filteredCertificates.length > 0 ? (
        <div className="certificates-table">
          <div className="table-header">
            <div className="col-token">Token ID</div>
            <div className="col-student">Student</div>
            <div className="col-course">Course</div>
            <div className="col-type">Type</div>
            <div className="col-grade">Grade</div>
            <div className="col-date">Issue Date</div>
            <div className="col-status">Status</div>
            <div className="col-actions">Actions</div>
          </div>

          {filteredCertificates.map(cert => (
            <div key={cert._id} className="table-row">
              <div className="col-token">#{cert.tokenId}</div>
              <div className="col-student">
                <div className="student-info">
                  <span className="student-name">{cert.studentName}</span>
                  <span className="student-id">{cert.studentId}</span>
                </div>
              </div>
              <div className="col-course">{cert.courseName}</div>
              <div className="col-type">{cert.certificateType}</div>
              <div className="col-grade">{cert.grade}</div>
              <div className="col-date">{formatDate(cert.createdAt)}</div>
              <div className="col-status">
                <span className={`status ${cert.isRevoked ? 'revoked' : 'active'}`}>
                  {cert.isRevoked ? 'Revoked' : 'Active'}
                </span>
              </div>
              <div className="col-actions">
                <div className="action-buttons">
                  <a href={`/verify/${cert.tokenId}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                    Verify
                  </a>
                  {cert.ipfsHash && (
                    <a href={`https://gateway.pinata.cloud/ipfs/${cert.ipfsHash}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                      View
                    </a>
                  )}
                  {!cert.isRevoked && (
                    <button onClick={() => { setSelectedCertificate(cert); setRevokeModal(true); }} className="btn btn-danger btn-sm">
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📜</div>
          <h3>No certificates found</h3>
          <p>{searchTerm || filterType !== 'all' ? 'Try adjusting your search or filter criteria' : 'No certificates have been issued yet'}</p>
          {!searchTerm && filterType === 'all' && (
            <button onClick={() => window.location.href = '/issue'} className="btn btn-primary">
              Issue First Certificate
            </button>
          )}
        </div>
      )}

      {/* Revoke Modal */}
      {revokeModal && (
        <div className="modal-overlay" onClick={() => setRevokeModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Revoke Certificate</h3>
              <button onClick={() => setRevokeModal(false)} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to revoke certificate #{selectedCertificate?.tokenId} for {selectedCertificate?.studentName}?</p>
              <div className="form-group">
                <label htmlFor="revokeReason">Reason for Revocation *</label>
                <textarea
                  id="revokeReason"
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="Enter reason for revoking this certificate..."
                  rows="4"
                  required
                />
              </div>
              <div className="revoke-warning">
                <strong>Warning:</strong> This action cannot be undone. The certificate will be permanently marked as revoked on the blockchain.
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setRevokeModal(false)} className="btn btn-outline">Cancel</button>
              <button onClick={handleRevoke} disabled={!revokeReason.trim() || loading} className="btn btn-danger">
                {loading ? 'Revoking...' : 'Revoke Certificate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyCertificate;
