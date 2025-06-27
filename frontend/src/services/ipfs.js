class IPFSService {
  constructor() {
    this.gateway = process.env.REACT_APP_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';
  }

  getIPFSUrl(hash) {
    return `${this.gateway}${hash}`;
  }

  async fetchMetadata(hash) {
    try {
      const response = await fetch(this.getIPFSUrl(hash));
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch IPFS metadata: ${error.message}`);
    }
  }

  async fetchFile(hash) {
    try {
      const response = await fetch(this.getIPFSUrl(hash));
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.blob();
    } catch (error) {
      throw new Error(`Failed to fetch IPFS file: ${error.message}`);
    }
  }

  isValidIPFSHash(hash) {
    const ipfsRegex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
    return ipfsRegex.test(hash);
  }
}

export default new IPFSService();