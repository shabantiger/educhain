# EduChain - Blockchain Certificate Management System

EduChain is a decentralized application for managing academic certificates on the blockchain. It allows educational institutions to issue, verify, and manage digital certificates securely.

## Features

- **Institution Registration**: Educational institutions can register and get verified
- **Certificate Issuance**: Issue digital certificates to students
- **Certificate Verification**: Public verification of certificates
- **Blockchain Integration**: All certificates are stored on Ethereum blockchain
- **Web3 Integration**: MetaMask wallet integration for transactions

## Project Structure

```
educhain/
├── backend/          # Backend API server and smart contracts
│   ├── contracts/    # Solidity smart contracts
│   ├── server.js     # Express.js API server
│   └── scripts/      # Deployment scripts
├── frontend/         # React.js frontend application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts
│   │   ├── services/     # API and blockchain services
│   │   └── utils/        # Utility functions
└── test/             # Test files
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask browser extension
- Git

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd educhain
```

### 2. Install dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup

Create a `.env` file in the backend directory:

```bash
cd backend
touch .env
```

Add the following environment variables:

```env
# JWT Secret (change this in production)
JWT_SECRET=your-super-secret-jwt-key

# Blockchain Network (optional)
NETWORK=sepolia

# Private Key for Contract Deployment (optional)
PRIVATE_KEY=your-private-key-here
```

### 4. Start the Backend Server

```bash
cd backend
npm start
```

The API server will start on `http://localhost:5000`

### 5. Start the Frontend Application

In a new terminal:

```bash
cd frontend
npm start
```

The React app will start on `http://localhost:3000`

## Usage

### For Institutions

1. **Register**: Visit the registration page and fill in your institution details
2. **Connect Wallet**: Connect your MetaMask wallet to the application
3. **Issue Certificates**: Use the dashboard to issue certificates to students
4. **Manage Certificates**: View and manage all issued certificates

### For Certificate Verification

1. **Public Verification**: Use the public verification page to verify certificates
2. **Enter Certificate ID**: Input the certificate ID to verify authenticity
3. **View Details**: See certificate details and verification status

## API Endpoints

### Authentication
- `POST /api/institutions/register` - Register new institution
- `POST /api/institutions/login` - Login institution
- `GET /api/institutions/profile` - Get institution profile (protected)

### Health Check
- `GET /api/health` - API health check

## Smart Contracts

The project includes smart contracts for certificate management:

- **CertificateNFT**: ERC-721 contract for certificate tokens
- **Ownable**: Access control for contract ownership
- **ReentrancyGuard**: Security against reentrancy attacks

## Development

### Running in Development Mode

```bash
# Backend with auto-reload
cd backend
npm run dev

# Frontend with auto-reload
cd frontend
npm start
```

### Compiling Smart Contracts

```bash
cd backend
npm run compile
```

### Deploying Smart Contracts

```bash
cd backend
npm run deploy
```

## Troubleshooting

### Common Issues

1. **Registration Fails**: Make sure the backend server is running on port 5000
2. **Wallet Connection Issues**: Ensure MetaMask is installed and connected
3. **API Errors**: Check that the backend server is running and accessible
4. **Contract Deployment**: Ensure you have sufficient testnet ETH for deployment

### Debug Mode

To enable debug logging, set the environment variable:

```bash
DEBUG=true npm start
```

## Security Notes

- Change the JWT secret in production
- Use environment variables for sensitive data
- Implement proper database storage in production
- Add rate limiting and input validation
- Use HTTPS in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please open an issue on the repository. 