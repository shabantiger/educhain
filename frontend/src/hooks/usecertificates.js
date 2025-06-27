import { useState, useEffect } from 'react';
import api from '../services/api';
import useAuth from './useAuth';

const useCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchCertificates = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/certificates/institution', { params });
      setCertificates(response.data.certificates);
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch certificates');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const searchCertificates = async (query, type = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/certificates/search', {
        params: { query, type }
      });
      
      return response.data.certificates;
    } catch (error) {
      setError(error.response?.data?.error || 'Search failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyCertificate = async (tokenId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/certificates/verify/${tokenId}`);
      return response.data.certificate;
    } catch (error) {
      setError(error.response?.data?.error || 'Verification failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const uploadCertificate = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/certificates/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.error || 'Upload failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const issueCertificate = async (certificateData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/certificates/issue', certificateData);
      
      // Refresh certificates list
      if (user) {
        await fetchCertificates();
      }
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.error || 'Issuance failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const revokeCertificate = async (tokenId, reason) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post(`/certificates/${tokenId}/revoke`, { reason });
      
      // Update local state
      setCertificates(prev => 
        prev.map(cert => 
          cert.tokenId === parseInt(tokenId)
            ? { ...cert, isRevoked: true, revokeReason: reason }
            : cert
        )
      );
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.error || 'Revocation failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/certificates/stats');
      return response.data.stats;
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch statistics');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getCertificatesByStudent = async (studentId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/certificates/student/${studentId}`);
      return response.data.certificates;
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch student certificates');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.isVerified) {
      fetchCertificates();
    }
  }, [user]);

  return {
    certificates,
    loading,
    error,
    fetchCertificates,
    searchCertificates,
    verifyCertificate,
    uploadCertificate,
    issueCertificate,
    revokeCertificate,
    getStatistics,
    getCertificatesByStudent
  };
};

export default useCertificates;
