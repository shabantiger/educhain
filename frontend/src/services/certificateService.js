import api from './api';

class CertificateService {
  // Upload certificate to IPFS
  async uploadCertificate(certificateData, file) {
    const formData = new FormData();
    formData.append('certificate', file);
    
    // Add all certificate details
    Object.keys(certificateData).forEach(key => {
      formData.append(key, certificateData[key]);
    });

    try {
      const response = await api.post('/certificates/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to upload certificate');
    }
  }

  // Issue certificate on blockchain
  async issueCertificate(certificateData) {
    try {
      const response = await api.post('/certificates/issue', certificateData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to issue certificate');
    }
  }

  // Verify certificate by token ID
  async verifyCertificate(tokenId) {
    try {
      const response = await api.get(`/certificates/verify/${tokenId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to verify certificate');
    }
  }

  // Get certificates by student ID
  async getCertificatesByStudent(studentId) {
    try {
      const response = await api.get(`/certificates/student/${studentId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch student certificates');
    }
  }

  // Get certificates by institution (requires authentication)
  async getCertificatesByInstitution() {
    try {
      const response = await api.get('/certificates/institution');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch institution certificates');
    }
  }

  // Revoke certificate
  async revokeCertificate(tokenId, reason) {
    try {
      const response = await api.post(`/certificates/revoke/${tokenId}`, { reason });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to revoke certificate');
    }
  }

  // Batch upload certificates
  async batchUploadCertificates(certificates, studentsData) {
    const formData = new FormData();
    
    // Add all certificate files
    certificates.forEach(file => {
      formData.append('certificates', file);
    });
    
    // Add students data as JSON string
    formData.append('studentsData', JSON.stringify(studentsData));

    try {
      const response = await api.post('/certificates/batch-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to batch upload certificates');
    }
  }

  // Search certificates
  async searchCertificates(query, type = 'all') {
    try {
      const response = await api.get('/certificates/search', {
        params: { query, type }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to search certificates');
    }
  }

  // Get certificate metadata from IPFS
  async getCertificateMetadata(ipfsHash) {
    try {
      const response = await api.get(`/certificates/metadata/${ipfsHash}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch certificate metadata');
    }
  }

  // Get dashboard statistics
  async getDashboardStats() {
    try {
      const response = await api.get('/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch dashboard statistics');
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Health check failed');
    }
  }
}

export default new CertificateService();