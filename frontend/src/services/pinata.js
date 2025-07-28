import axios from 'axios';

const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.REACT_APP_PINATA_SECRET_API_KEY;
const PINATA_BASE_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

export const uploadToPinata = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(PINATA_BASE_URL, formData, {
    maxContentLength: 'Infinity',
    headers: {
      'Content-Type': 'multipart/form-data',
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_API_KEY,
    },
  });

  // Returns the IPFS hash
  return response.data.IpfsHash;
}; 