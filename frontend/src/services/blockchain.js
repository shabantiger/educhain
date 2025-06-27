// client/src/services/blockchain.js
import { ethers } from 'ethers';
import contractABI from '../contracts/AcademicCertificateNFT.json';

class BlockchainService {
  constructor() {
    this.contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
    this.baseRpcUrl = process.env.REACT_APP_BASE_RPC_URL;
    this.provider = null;
    this.contract = null;
  }

  async init() {
    if (window.ethereum) {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.contract = new ethers.Contract(
        this.contractAddress,
        contractABI.abi,
        this.provider
      );
    } else {
      // Fallback to read-only provider
      this.provider = new ethers.providers.JsonRpcProvider(this.baseRpcUrl);
      this.contract = new ethers.Contract(
        this.contractAddress,
        contractABI.abi,
        this.provider
      );
    }
  }

  async connectWallet() {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = this.provider.getSigner();
      const address = await signer.getAddress();
      
      this.contract = new ethers.Contract(
        this.contractAddress,
        contractABI.abi,
        signer
      );

      return { success: true, address };
    } catch (error) {
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }

  async switchToBaseNetwork() {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x2105' }], // Base mainnet
      });
    } catch (switchError) {
      // If the chain hasn't been added to MetaMask, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x2105',
              chainName: 'Base',
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://mainnet.base.org'],
              blockExplorerUrls: ['https://basescan.org/'],
            }],
          });
        } catch (addError) {
          throw new Error('Failed to add Base network to MetaMask');
        }
      } else {
        throw new Error('Failed to switch to Base network');
      }
    }
  }

  async getAccount() {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const signer = this.provider.getSigner();
      return await signer.getAddress();
    } catch (error) {
      throw new Error('No account connected');
    }
  }

  async getNetwork() {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    return await this.provider.getNetwork();
  }

  async verifyCertificate(tokenId) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const result = await this.contract.verifyCertificate(tokenId);
      return {
        exists: result.exists,
        isRevoked: result.isRevoked,
        studentName: result.studentName,
        courseName: result.courseName,
        institutionName: result.institutionName,
        issueDate: new Date(result.issueDate.toNumber() * 1000),
        graduationDate: new Date(result.graduationDate.toNumber() * 1000),
        grade: result.grade
      };
    } catch (error) {
      throw new Error(`Failed to verify certificate: ${error.message}`);
    }
  }

  async getCertificatesByStudent(studentId) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tokenIds = await this.contract.getCertificatesByStudent(studentId);
      return tokenIds.map(id => id.toNumber());
    } catch (error) {
      throw new Error(`Failed to get student certificates: ${error.message}`);
    }
  }

  async isInstitutionVerified(address) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      return await this.contract.isInstitutionVerified(address);
    } catch (error) {
      throw new Error(`Failed to check institution verification: ${error.message}`);
    }
  }

  async getTotalCertificates() {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const total = await this.contract.getTotalCertificates();
      return total.toNumber();
    } catch (error) {
      throw new Error(`Failed to get total certificates: ${error.message}`);
    }
  }
}

export default new BlockchainService();