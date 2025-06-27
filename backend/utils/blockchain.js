const { ethers } = require('ethers');
const contractABI = require('../contract-abi.json');

class BlockchainService {
  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(process.env.BASE_RPC_URL);
    this.contractAddress = process.env.CONTRACT_ADDRESS;
    this.contract = new ethers.Contract(this.contractAddress, contractABI, this.provider);
  }

  async issueCertificateOnChain(certificateData) {
    try {
      const {
        studentWalletAddress,
        studentName,
        studentId,
        courseName,
        grade,
        certificateType,
        graduationDate,
        ipfsHash,
        institutionWallet
      } = certificateData;

      // Create wallet instance for the institution
      const wallet = new ethers.Wallet(process.env.INSTITUTION_PRIVATE_KEY, this.provider);
      const contractWithSigner = this.contract.connect(wallet);

      // Convert graduation date to timestamp
      const graduationTimestamp = Math.floor(new Date(graduationDate).getTime() / 1000);

      // Issue certificate
      const tx = await contractWithSigner.issueCertificate(
        studentWalletAddress,
        studentName,
        studentId,
        courseName,
        grade,
        certificateType,
        graduationTimestamp,
        ipfsHash
      );

      const receipt = await tx.wait();

      // Extract token ID from event
      const event = receipt.events?.find(e => e.event === 'CertificateIssued');
      const tokenId = event?.args?.tokenId?.toNumber();

      return {
        success: true,
        tokenId,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Blockchain issuance error:', error);
      throw new Error(`Failed to issue certificate on blockchain: ${error.message}`);
    }
  }

  async verifyCertificateOnChain(tokenId) {
    try {
      const result = await this.contract.verifyCertificate(tokenId);

      return {
        exists: result.exists,
        isRevoked: result.isRevoked,
        studentName: result.studentName,
        courseName: result.courseName,
        institutionName: result.institutionName,
        issueDate: result.issueDate.toNumber(),
        graduationDate: result.graduationDate.toNumber(),
        grade: result.grade
      };
    } catch (error) {
      console.error('Blockchain verification error:', error);
      throw new Error(`Failed to verify certificate on blockchain: ${error.message}`);
    }
  }

  async revokeCertificateOnChain(tokenId, reason) {
    try {
      const wallet = new ethers.Wallet(process.env.INSTITUTION_PRIVATE_KEY, this.provider);
      const contractWithSigner = this.contract.connect(wallet);

      const tx = await contractWithSigner.revokeCertificate(tokenId, reason);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Blockchain revocation error:', error);
      throw new Error(`Failed to revoke certificate on blockchain: ${error.message}`);
    }
  }

  async getCertificatesByStudent(studentId) {
    try {
      const tokenIds = await this.contract.getCertificatesByStudent(studentId);
      return tokenIds.map(id => id.toNumber());
    } catch (error) {
      console.error('Error fetching student certificates:', error);
      throw new Error(`Failed to fetch student certificates: ${error.message}`);
    }
  }

  async getCertificatesByInstitution(institutionAddress) {
    try {
      const tokenIds = await this.contract.getCertificatesByInstitution(institutionAddress);
      return tokenIds.map(id => id.toNumber());
    } catch (error) {
      console.error('Error fetching institution certificates:', error);
      throw new Error(`Failed to fetch institution certificates: ${error.message}`);
    }
  }

  async getTotalCertificates() {
    try {
      const total = await this.contract.getTotalCertificates();
      return total.toNumber();
    } catch (error) {
      console.error('Error fetching total certificates:', error);
      throw new Error(`Failed to fetch total certificates: ${error.message}`);
    }
  }
}

const blockchainService = new BlockchainService();

module.exports = {
  issueCertificateOnChain: (data) => blockchainService.issueCertificateOnChain(data),
  verifyCertificateOnChain: (tokenId) => blockchainService.verifyCertificateOnChain(tokenId),
  revokeCertificateOnChain: (tokenId, reason) => blockchainService.revokeCertificateOnChain(tokenId, reason),
  getCertificatesByStudent: (studentId) => blockchainService.getCertificatesByStudent(studentId),
  getCertificatesByInstitution: (address) => blockchainService.getCertificatesByInstitution(address),
  getTotalCertificates: () => blockchainService.getTotalCertificates()
};