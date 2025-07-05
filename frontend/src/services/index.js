// Import all services
import api from './api';
import certificateService from './certificateService';
import blockchainService from './blockchain';
import ipfsService from './ipfs';
import notificationService from './notificationService';

// Service integration class
class ServiceLayer {
  constructor() {
    this.api = api;
    this.certificate = certificateService;
    this.blockchain = blockchainService;
    this.ipfs = ipfsService;
    this.notification = notificationService;
  }

  // Initialize all services
  async init() {
    try {
      // Initialize blockchain service
      await this.blockchain.init();
      
      // Check backend health
      await this.checkBackendHealth();
      
      return { success: true };
    } catch (error) {
      console.error('Service initialization failed:', error);
      this.notification.error('Failed to initialize services');
      return { success: false, error: error.message };
    }
  }

  // Check backend health
  async checkBackendHealth() {
    try {
      const health = await this.certificate.healthCheck();
      console.log('Backend health check:', health);
      return health;
    } catch (error) {
      console.error('Backend health check failed:', error);
      throw error;
    }
  }

  // Complete certificate issuance workflow
  async issueCertificateWorkflow(certificateData, file) {
    const loadingId = this.notification.loading('Processing certificate...');
    
    try {
      // Step 1: Upload to IPFS
      this.notification.updateNotification(loadingId, {
        message: 'Uploading certificate to IPFS...'
      });
      
      const uploadResult = await this.certificate.uploadCertificate(certificateData, file);
      
      // Step 2: Issue on blockchain
      this.notification.updateNotification(loadingId, {
        message: 'Issuing certificate on blockchain...'
      });
      
      const issueResult = await this.certificate.issueCertificate({
        ...certificateData,
        ipfsHash: uploadResult.ipfsHash
      });
      
      // Step 3: Success
      this.notification.removeNotification(loadingId);
      this.notification.showTransactionProgress(
        'Certificate issued successfully!',
        issueResult.transactionHash
      );
      
      return {
        success: true,
        tokenId: issueResult.tokenId,
        transactionHash: issueResult.transactionHash,
        ipfsHash: uploadResult.ipfsHash
      };
      
    } catch (error) {
      this.notification.removeNotification(loadingId);
      this.notification.error(`Certificate issuance failed: ${error.message}`);
      throw error;
    }
  }

  // Complete certificate verification workflow
  async verifyCertificateWorkflow(tokenId) {
    const loadingId = this.notification.loading('Verifying certificate...');
    
    try {
      // Try backend verification first (more detailed)
      let certificateData;
      try {
        certificateData = await this.certificate.verifyCertificate(tokenId);
      } catch (backendError) {
        // Fallback to blockchain verification
        console.log('Backend verification failed, trying blockchain...');
        await this.blockchain.init();
        certificateData = await this.blockchain.verifyCertificate(tokenId);
      }
      
      this.notification.removeNotification(loadingId);
      
      if (certificateData.exists) {
        this.notification.showVerificationResult(true, certificateData);
        return { success: true, data: certificateData };
      } else {
        this.notification.showVerificationResult(false);
        return { success: false, error: 'Certificate not found' };
      }
      
    } catch (error) {
      this.notification.removeNotification(loadingId);
      this.notification.error(`Verification failed: ${error.message}`);
      throw error;
    }
  }

  // Connect wallet workflow
  async connectWalletWorkflow() {
    try {
      const result = await this.blockchain.connectWallet();
      
      if (result.success) {
        this.notification.showWalletStatus(true, result.address);
        return result;
      } else {
        this.notification.error('Failed to connect wallet');
        return result;
      }
    } catch (error) {
      this.notification.error(`Wallet connection failed: ${error.message}`);
      throw error;
    }
  }

  // Get institution dashboard data
  async getInstitutionDashboard() {
    try {
      const [stats, certificates] = await Promise.all([
        this.certificate.getDashboardStats(),
        this.certificate.getCertificatesByInstitution()
      ]);
      
      return {
        success: true,
        stats,
        certificates: certificates.certificates || []
      };
    } catch (error) {
      this.notification.error(`Failed to load dashboard: ${error.message}`);
      throw error;
    }
  }

  // Get student certificates
  async getStudentCertificates(studentId) {
    try {
      const result = await this.certificate.getCertificatesByStudent(studentId);
      return {
        success: true,
        certificates: result.certificates || []
      };
    } catch (error) {
      this.notification.error(`Failed to load certificates: ${error.message}`);
      throw error;
    }
  }

  // Search certificates
  async searchCertificates(query, type) {
    try {
      const result = await this.certificate.searchCertificates(query, type);
      return {
        success: true,
        certificates: result.certificates || []
      };
    } catch (error) {
      this.notification.error(`Search failed: ${error.message}`);
      throw error;
    }
  }

  // Revoke certificate workflow
  async revokeCertificateWorkflow(tokenId, reason) {
    const loadingId = this.notification.loading('Revoking certificate...');
    
    try {
      const result = await this.certificate.revokeCertificate(tokenId, reason);
      
      this.notification.removeNotification(loadingId);
      this.notification.showTransactionProgress(
        'Certificate revoked successfully',
        result.transactionHash
      );
      
      return { success: true, ...result };
    } catch (error) {
      this.notification.removeNotification(loadingId);
      this.notification.error(`Certificate revocation failed: ${error.message}`);
      throw error;
    }
  }

  // Batch upload workflow
  async batchUploadWorkflow(files, studentsData) {
    const loadingId = this.notification.loading('Processing batch upload...');
    
    try {
      const result = await this.certificate.batchUploadCertificates(files, studentsData);
      
      this.notification.removeNotification(loadingId);
      
      if (result.errors && result.errors.length > 0) {
        this.notification.warning(
          `Batch upload completed with ${result.errors.length} errors out of ${files.length} files`
        );
      } else {
        this.notification.success(`Successfully uploaded ${result.processed} certificates`);
      }
      
      return { success: true, ...result };
    } catch (error) {
      this.notification.removeNotification(loadingId);
      this.notification.error(`Batch upload failed: ${error.message}`);
      throw error;
    }
  }

  // Get certificate metadata from IPFS
  async getCertificateMetadata(ipfsHash) {
    try {
      let metadata;
      
      // Try backend first
      try {
        metadata = await this.certificate.getCertificateMetadata(ipfsHash);
      } catch (backendError) {
        // Fallback to direct IPFS
        metadata = await this.ipfs.fetchMetadata(ipfsHash);
      }
      
      return { success: true, metadata };
    } catch (error) {
      this.notification.error(`Failed to fetch metadata: ${error.message}`);
      throw error;
    }
  }

  // Utility methods
  formatWalletAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  formatDate(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }

  formatTokenId(tokenId) {
    return `#${tokenId}`;
  }

  isValidIPFSHash(hash) {
    return this.ipfs.isValidIPFSHash(hash);
  }

  getIPFSUrl(hash) {
    return this.ipfs.getIPFSUrl(hash);
  }
}

// Create and export service instance
const services = new ServiceLayer();

// Export individual services for direct access
export {
  api,
  certificateService,
  blockchainService,
  ipfsService,
  notificationService
};

// Export unified service layer as default
export default services;