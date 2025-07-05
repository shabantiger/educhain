# EduChain - Blockchain Academic Certificate System

A comprehensive blockchain-based system for issuing, storing, and verifying academic certificates using NFTs on the Base blockchain.

## 🚀 Features

### Backend Features
- **Institution Management**: Registration, login, and verification system
- **Certificate Issuance**: Upload certificates to IPFS and mint NFTs on Base blockchain
- **Certificate Verification**: Verify certificates through blockchain and database
- **Batch Operations**: Upload multiple certificates at once
- **Search & Analytics**: Search certificates and view dashboard statistics
- **RESTful API**: Comprehensive API endpoints for all operations

### Frontend Features
- **Modern React UI**: Clean, responsive user interface
- **Wallet Integration**: MetaMask wallet connection and management
- **Real-time Notifications**: User feedback for all operations
- **Multi-role Support**: Institution and student portals
- **Certificate Verification**: Public verification interface
- **Responsive Design**: Works on desktop and mobile devices

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Blockchain    │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (Base Chain)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web3 Wallet   │    │   MongoDB       │    │   IPFS/Pinata   │
│   (MetaMask)    │    │   Database      │    │   Storage       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **ethers.js** for blockchain interaction
- **Pinata SDK** for IPFS storage
- **JWT** for authentication
- **bcryptjs** for password hashing
- **multer** for file uploads
- **CORS** and rate limiting for security

### Frontend
- **React** with hooks and context
- **React Router** for navigation
- **axios** for API calls
- **ethers.js** for blockchain interaction
- **Web3** wallet integration
- **Responsive CSS** for styling

### Blockchain
- **Base Chain** (Ethereum Layer 2)
- **ERC-721** NFT standard
- **IPFS** for metadata storage
- **Smart contract** for certificate management

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- MetaMask browser extension
- Pinata account for IPFS storage
- Base blockchain testnet/mainnet access

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd educhain
```

### 2. Backend Setup
```bash
cd backend
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configurations
nano .env
```

**Required Environment Variables:**
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/academic_certificates
BASE_RPC_URL=https://mainnet.base.org
CONTRACT_ADDRESS=your_contract_address
INSTITUTION_PRIVATE_KEY=your_private_key
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
JWT_SECRET=your_jwt_secret
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configurations
nano .env
```

**Required Environment Variables:**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_CONTRACT_ADDRESS=your_contract_address
REACT_APP_BASE_RPC_URL=https://mainnet.base.org
REACT_APP_PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

### 4. Database Setup
```bash
# Start MongoDB
mongod

# The application will automatically create collections
```

### 5. Run the Application
```bash
# Terminal 1: Start Backend
cd backend
npm start

# Terminal 2: Start Frontend
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/institutions/register` - Register new institution
- `POST /api/institutions/login` - Institution login

### Certificate Endpoints
- `POST /api/certificates/upload` - Upload certificate to IPFS
- `POST /api/certificates/issue` - Issue certificate on blockchain
- `GET /api/certificates/verify/:tokenId` - Verify certificate
- `GET /api/certificates/student/:studentId` - Get student certificates
- `GET /api/certificates/institution` - Get institution certificates
- `POST /api/certificates/revoke/:tokenId` - Revoke certificate
- `POST /api/certificates/batch-upload` - Batch upload certificates
- `GET /api/certificates/search` - Search certificates

### Utility Endpoints
- `GET /api/health` - Health check
- `GET /api/stats` - Dashboard statistics
- `GET /api/certificates/metadata/:ipfsHash` - Get IPFS metadata

## 🎯 Usage Guide

### For Educational Institutions

1. **Register Institution**
   - Fill out registration form
   - Provide wallet address
   - Wait for verification

2. **Issue Certificates**
   - Upload certificate files (PDF/Images)
   - Fill student details
   - Submit for blockchain minting

3. **Manage Certificates**
   - View issued certificates
   - Search certificates
   - Revoke if necessary

### For Students

1. **Connect Wallet**
   - Install MetaMask
   - Connect to Base network
   - View your certificates

2. **Verify Certificates**
   - Enter token ID
   - View verification results
   - Download certificate

### For Employers/Verifiers

1. **Public Verification**
   - Enter certificate token ID
   - View verification status
   - Check certificate details

## 🔒 Security Features

- **JWT Authentication**: Secure API access
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Sanitize all inputs
- **CORS Protection**: Cross-origin request security
- **Blockchain Verification**: Immutable certificate records
- **IPFS Storage**: Decentralized file storage

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### API Testing
Use the provided Postman collection or test endpoints manually:
```bash
# Health check
curl http://localhost:5000/api/health

# Verify certificate
curl http://localhost:5000/api/certificates/verify/1
```

## 📊 Monitoring & Analytics

### Health Monitoring
- Database connection status
- Blockchain connectivity
- IPFS service status
- API response times

### Dashboard Analytics
- Total certificates issued
- Active/revoked certificates
- Certificate types breakdown
- Recent activity

## 🔧 Troubleshooting

### Common Issues

**Backend won't start:**
- Check MongoDB connection
- Verify environment variables
- Ensure port 5000 is available

**Frontend wallet connection fails:**
- Install MetaMask extension
- Switch to Base network
- Check network configuration

**Certificate verification fails:**
- Verify contract address
- Check blockchain connection
- Ensure token ID exists

**File upload issues:**
- Check file size limits
- Verify file types allowed
- Ensure Pinata credentials

### Debug Mode
Enable debug logging:
```env
REACT_APP_DEBUG=true
LOG_LEVEL=debug
```

## 🚀 Deployment

### Backend Deployment
```bash
# Build for production
npm run build

# Start with PM2
pm2 start ecosystem.config.js
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy to hosting service
# (Netlify, Vercel, etc.)
```

### Docker Deployment
```bash
# Backend
docker build -t educhain-backend ./backend
docker run -p 5000:5000 educhain-backend

# Frontend
docker build -t educhain-frontend ./frontend
docker run -p 3000:3000 educhain-frontend
```

## 📚 Additional Resources

- [Base Blockchain Documentation](https://docs.base.org)
- [Pinata IPFS Documentation](https://docs.pinata.cloud)
- [MetaMask Integration Guide](https://docs.metamask.io)
- [React Documentation](https://reactjs.org/docs)
- [Node.js Documentation](https://nodejs.org/docs)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

**Built with ❤️ for the future of academic credentials**