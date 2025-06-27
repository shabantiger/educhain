const pinataSDK = require('@pinata/sdk');

class IPFSService {
  constructor() {
    this.pinata = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_KEY);
  }

  async uploadToIPFS(data, options = {}) {
    try {
      const result = await this.pinata.pinFileToIPFS(data, {
        pinataMetadata: {
          name: options.name || `file-${Date.now()}`,
          keyvalues: options.keyvalues || {}
        },
        pinataOptions: {
          cidVersion: 1
        }
      });

      return {
        success: true,
        IpfsHash: result.IpfsHash,
        PinSize: result.PinSize,
        Timestamp: result.Timestamp
      };
    } catch (error) {
      console.error('IPFS upload error:', error);
      throw new Error(`Failed to upload to IPFS: ${error.message}`);
    }
  }

  async uploadJSONToIPFS(json, options = {}) {
    try {
      const result = await this.pinata.pinJSONToIPFS(json, {
        pinataMetadata: {
          name: options.name || `json-${Date.now()}`,
          keyvalues: options.keyvalues || {}
        },
        pinataOptions: {
          cidVersion: 1
        }
      });

      return {
        success: true,
        IpfsHash: result.IpfsHash,
        PinSize: result.PinSize,
        Timestamp: result.Timestamp
      };
    } catch (error) {
      console.error('IPFS JSON upload error:', error);
      throw new Error(`Failed to upload JSON to IPFS: ${error.message}`);
    }
  }

  async fetchFromIPFS(hash) {
    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${hash}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.blob();
      }
    } catch (error) {
      console.error('IPFS fetch error:', error);
      throw new Error(`Failed to fetch from IPFS: ${error.message}`);
    }
  }

  async testConnection() {
    try {
      await this.pinata.testAuthentication();
      return { success: true, message: 'IPFS connection successful' };
    } catch (error) {
      console.error('IPFS connection test failed:', error);
      throw new Error(`IPFS connection failed: ${error.message}`);
    }
  }

  generateCertificateMetadata(certificateData) {
    return {
      name: `Academic Certificate - ${certificateData.studentName}`,
      description: `${certificateData.certificateType} in ${certificateData.courseName} awarded to ${certificateData.studentName} by ${certificateData.institutionName}`,
      image: certificateData.imageUrl,
      external_url: `${process.env.FRONTEND_URL}/verify/${certificateData.tokenId}`,
      attributes: [
        {
          trait_type: "Student Name",
          value: certificateData.studentName
        },
        {
          trait_type: "Course",
          value: certificateData.courseName
        },
        {
          trait_type: "Grade",
          value: certificateData.grade
        },
        {
          trait_type: "Institution",
          value: certificateData.institutionName
        },
        {
          trait_type: "Certificate Type",
          value: certificateData.certificateType
        },
        {
          trait_type: "Issue Date",
          value: new Date(certificateData.issueDate).toISOString().split('T')[0]
        },
        {
          trait_type: "Graduation Date",
          value: new Date(certificateData.graduationDate).toISOString().split('T')[0]
        }
      ],
      properties: {
        certificate_data: certificateData,
        verification_url: `${process.env.FRONTEND_URL}/verify/${certificateData.tokenId}`,
        blockchain: "Base",
        standard: "ERC-721"
      }
    };
  }
}

const ipfsService = new IPFSService();

module.exports = {
  uploadToIPFS: (data, options) => ipfsService.uploadToIPFS(data, options),
  uploadJSONToIPFS: (json, options) => ipfsService.uploadJSONToIPFS(json, options),
  fetchFromIPFS: (hash) => ipfsService.fetchFromIPFS(hash),
  testConnection: () => ipfsService.testConnection(),
  generateCertificateMetadata: (data) => ipfsService.generateCertificateMetadata(data)
};
