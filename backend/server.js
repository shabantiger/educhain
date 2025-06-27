// server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { ethers } = require('ethers');
const pinataSDK = require('@pinata/sdk');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/academic_certificates', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Database schemas
const InstitutionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    walletAddress: { type: String, required: true },
    registrationNumber: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    contactInfo: {
        phone: String,
        address: String,
        website: String
    },
    createdAt: { type: Date, default: Date.now }
});

const CertificateSchema = new mongoose.Schema({
    tokenId: { type: Number, required: true, unique: true },
    studentName: { type: String, required: true },
    studentId: { type: String, required: true },
    studentEmail: { type: String, required: true },
    courseName: { type: String, required: true },
    grade: { type: String, required: true },
    certificateType: { type: String, required: true },
    institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' },
    ipfsHash: { type: String, required: true },
    transactionHash: { type: String, required: true },
    issueDate: { type: Date, required: true },
    graduationDate: { type: Date, required: true },
    isRevoked: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const Institution = mongoose.model('Institution', InstitutionSchema);
const Certificate = mongoose.model('Certificate', CertificateSchema);

// Blockchain setup
const provider = new ethers.providers.JsonRpcProvider(process.env.BASE_RPC_URL);
const contractAddress = process.env.CONTRACT_ADDRESS;
const contractABI = require('./contract-abi.json'); // Contract ABI
const contract = new ethers.Contract(contractAddress, contractABI, provider);

// IPFS setup
const pinata = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_KEY);

// Multer configuration for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only images and PDFs are allowed'));
        }
    }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Helper function to generate certificate PDF metadata
const generateCertificateMetadata = (certificateData) => {
    return {
        name: `Academic Certificate - ${certificateData.studentName}`,
        description: `${certificateData.certificateType} in ${certificateData.courseName} awarded to ${certificateData.studentName}`,
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
};

// Routes

// Institution registration
app.post('/api/institutions/register', async (req, res) => {
    try {
        const { name, email, password, walletAddress, registrationNumber, contactInfo } = req.body;

        // Validate required fields
        if (!name || !email || !password || !walletAddress || !registrationNumber) {
            return res.status(400).json({ error: 'All required fields must be provided' });
        }

        // Check if institution already exists
        const existingInstitution = await Institution.findOne({ 
            $or: [{ email }, { walletAddress }, { registrationNumber }] 
        });
        
        if (existingInstitution) {
            return res.status(400).json({ error: 'Institution already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new institution
        const institution = new Institution({
            name,
            email,
            password: hashedPassword,
            walletAddress: walletAddress.toLowerCase(),
            registrationNumber,
            contactInfo
        });

        await institution.save();

        res.status(201).json({
            message: 'Institution registered successfully',
            institutionId: institution._id,
            walletAddress: institution.walletAddress
        });
    } catch (error) {
        console.error('Institution registration error:', error);
        res.status(500).json({ error: 'Failed to register institution' });
    }
});

// Institution login
app.post('/api/institutions/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const institution = await Institution.findOne({ email });
        if (!institution) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, institution.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { 
                institutionId: institution._id,
                walletAddress: institution.walletAddress,
                name: institution.name
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            institution: {
                id: institution._id,
                name: institution.name,
                email: institution.email,
                walletAddress: institution.walletAddress,
                isVerified: institution.isVerified
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Upload certificate to IPFS
app.post('/api/certificates/upload', authenticateToken, upload.single('certificate'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Certificate file is required' });
        }

        const { studentName, studentId, studentEmail, courseName, grade, certificateType, graduationDate } = req.body;

        // Validate required fields
        if (!studentName || !studentId || !studentEmail || !courseName || !grade || !certificateType || !graduationDate) {
            return res.status(400).json({ error: 'All certificate details are required' });
        }

        // Get institution details
        const institution = await Institution.findById(req.user.institutionId);
        if (!institution) {
            return res.status(404).json({ error: 'Institution not found' });
        }

        if (!institution.isVerified) {
            return res.status(403).json({ error: 'Institution must be verified to issue certificates' });
        }

        // Upload certificate image/PDF to IPFS
        const fileResult = await pinata.pinFileToIPFS(req.file.buffer, {
            pinataMetadata: {
                name: `certificate-${studentId}-${Date.now()}`,
                keyvalues: {
                    studentId: studentId,
                    courseName: courseName,
                    institution: institution.name
                }
            }
        });

        // Generate certificate metadata
        const certificateData = {
            studentName,
            studentId,
            studentEmail,
            courseName,
            grade,
            certificateType,
            institutionName: institution.name,
            issueDate: new Date(),
            graduationDate: new Date(graduationDate),
            imageUrl: `https://gateway.pinata.cloud/ipfs/${fileResult.IpfsHash}`
        };

        const metadata = generateCertificateMetadata(certificateData);

        // Upload metadata to IPFS
        const metadataResult = await pinata.pinJSONToIPFS(metadata, {
            pinataMetadata: {
                name: `metadata-${studentId}-${Date.now()}`
            }
        });

        res.json({
            success: true,
            ipfsHash: metadataResult.IpfsHash,
            fileHash: fileResult.IpfsHash,
            metadata: metadata,
            certificateData: certificateData
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload certificate' });
    }
});

// Issue certificate on blockchain
app.post('/api/certificates/issue', authenticateToken, async (req, res) => {
    try {
        const { 
            studentWalletAddress, 
            studentName, 
            studentId, 
            studentEmail,
            courseName, 
            grade, 
            certificateType, 
            graduationDate, 
            ipfsHash 
        } = req.body;

        // Validate required fields
        if (!studentWalletAddress || !studentName || !studentId || !courseName || !grade || !ipfsHash) {
            return res.status(400).json({ error: 'All required fields must be provided' });
        }

        // Get institution details
        const institution = await Institution.findById(req.user.institutionId);
        if (!institution || !institution.isVerified) {
            return res.status(403).json({ error: 'Institution not verified' });
        }

        // Create wallet instance for the institution
        const wallet = new ethers.Wallet(process.env.INSTITUTION_PRIVATE_KEY, provider);
        const contractWithSigner = contract.connect(wallet);

        // Issue certificate on blockchain
        const tx = await contractWithSigner.issueCertificate(
            studentWalletAddress,
            studentName,
            studentId,
            courseName,
            grade,
            certificateType,
            Math.floor(new Date(graduationDate).getTime() / 1000),
            ipfsHash
        );

        await tx.wait();

        // Get token ID from transaction receipt
        const receipt = await tx.wait();
        const event = receipt.events?.find(e => e.event === 'CertificateIssued');
        const tokenId = event?.args?.tokenId?.toNumber();

        // Save certificate to database
        const certificate = new Certificate({
            tokenId,
            studentName,
            studentId,
            studentEmail,
            courseName,
            grade,
            certificateType,
            institutionId: institution._id,
            ipfsHash,
            transactionHash: tx.hash,
            issueDate: new Date(),
            graduationDate: new Date(graduationDate)
        });

        await certificate.save();

        res.json({
            success: true,
            tokenId,
            transactionHash: tx.hash,
            message: 'Certificate issued successfully'
        });

    } catch (error) {
        console.error('Certificate issuance error:', error);
        res.status(500).json({ error: 'Failed to issue certificate' });
    }
});

// Verify certificate
app.get('/api/certificates/verify/:tokenId', async (req, res) => {
    try {
        const { tokenId } = req.params;

        // Get certificate from blockchain
        const result = await contract.verifyCertificate(tokenId);
        
        if (!result.exists) {
            return res.status(404).json({ error: 'Certificate not found' });
        }

        // Get additional details from database
        const dbCertificate = await Certificate.findOne({ tokenId }).populate('institutionId');

        const certificateData = {
            exists: result.exists,
            isRevoked: result.isRevoked,
            studentName: result.studentName,
            courseName: result.courseName,
            institutionName: result.institutionName,
            issueDate: new Date(result.issueDate.toNumber() * 1000),
            graduationDate: new Date(result.graduationDate.toNumber() * 1000),
            grade: result.grade,
            tokenId: tokenId,
            additionalInfo: dbCertificate ? {
                certificateType: dbCertificate.certificateType,
                transactionHash: dbCertificate.transactionHash,
                ipfsHash: dbCertificate.ipfsHash
            } : null
        };

        res.json(certificateData);
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Failed to verify certificate' });
    }
});

// Get certificates by student
app.get('/api/certificates/student/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        
        const certificates = await Certificate.find({ studentId })
            .populate('institutionId', 'name')
            .sort({ createdAt: -1 });

        res.json({ certificates });
    } catch (error) {
        console.error('Error fetching student certificates:', error);
        res.status(500).json({ error: 'Failed to fetch certificates' });
    }
});

// Get certificates by institution
app.get('/api/certificates/institution', authenticateToken, async (req, res) => {
    try {
        const certificates = await Certificate.find({ institutionId: req.user.institutionId })
            .sort({ createdAt: -1 });

        res.json({ certificates });
    } catch (error) {
        console.error('Error fetching institution certificates:', error);
        res.status(500).json({ error: 'Failed to fetch certificates' });
    }
});

// Health check
app.get('/api/health', async (req, res) => {
    try {
        // Check database connection
        const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
        
        // Check blockchain connection
        let blockchainStatus = 'disconnected';
        try {
            await provider.getBlockNumber();
            blockchainStatus = 'connected';
        } catch (error) {
            console.error('Blockchain connection error:', error);
        }

        // Check IPFS connection
        let ipfsStatus = 'disconnected';
        try {
            await pinata.testAuthentication();
            ipfsStatus = 'connected';
        } catch (error) {
            console.error('IPFS connection error:', error);
        }

        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                database: dbStatus,
                blockchain: blockchainStatus,
                ipfs: ipfsStatus
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

// Get dashboard statistics
app.get('/api/stats', authenticateToken, async (req, res) => {
    try {
        const institutionId = req.user.institutionId;

        const stats = await Promise.all([
            Certificate.countDocuments({ institutionId }),
            Certificate.countDocuments({ institutionId, isRevoked: false }),
            Certificate.countDocuments({ institutionId, isRevoked: true }),
            Certificate.aggregate([
                { $match: { institutionId: new mongoose.Types.ObjectId(institutionId) } },
                { $group: { _id: '$certificateType', count: { $sum: 1 } } }
            ])
        ]);

        res.json({
            totalCertificates: stats[0],
            activeCertificates: stats[1],
            revokedCertificates: stats[2],
            certificatesByType: stats[3]
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Revoke certificate
app.post('/api/certificates/revoke/:tokenId', authenticateToken, async (req, res) => {
    try {
        const { tokenId } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({ error: 'Revocation reason is required' });
        }

        // Check if certificate belongs to this institution
        const certificate = await Certificate.findOne({ 
            tokenId, 
            institutionId: req.user.institutionId 
        });

        if (!certificate) {
            return res.status(404).json({ error: 'Certificate not found or not authorized' });
        }

        if (certificate.isRevoked) {
            return res.status(400).json({ error: 'Certificate already revoked' });
        }

        // Revoke on blockchain
        const wallet = new ethers.Wallet(process.env.INSTITUTION_PRIVATE_KEY, provider);
        const contractWithSigner = contract.connect(wallet);

        const tx = await contractWithSigner.revokeCertificate(tokenId, reason);
        await tx.wait();

        // Update database
        certificate.isRevoked = true;
        await certificate.save();

        res.json({
            success: true,
            message: 'Certificate revoked successfully',
            transactionHash: tx.hash
        });
    } catch (error) {
        console.error('Revocation error:', error);
        res.status(500).json({ error: 'Failed to revoke certificate' });
    }
});

// Batch certificate operations
app.post('/api/certificates/batch-upload', authenticateToken, upload.array('certificates', 50), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No certificate files provided' });
        }

        const { studentsData } = req.body; // JSON string of student data array
        const students = JSON.parse(studentsData);

        if (req.files.length !== students.length) {
            return res.status(400).json({ error: 'Number of files must match number of student records' });
        }

        const institution = await Institution.findById(req.user.institutionId);
        if (!institution || !institution.isVerified) {
            return res.status(403).json({ error: 'Institution not verified' });
        }

        const results = [];
        const errors = [];

        for (let i = 0; i < req.files.length; i++) {
            try {
                const file = req.files[i];
                const studentData = students[i];

                // Upload to IPFS
                const fileResult = await pinata.pinFileToIPFS(file.buffer, {
                    pinataMetadata: {
                        name: `certificate-${studentData.studentId}-batch-${Date.now()}`,
                    }
                });

                const certificateData = {
                    ...studentData,
                    institutionName: institution.name,
                    issueDate: new Date(),
                    graduationDate: new Date(studentData.graduationDate),
                    imageUrl: `https://gateway.pinata.cloud/ipfs/${fileResult.IpfsHash}`
                };

                const metadata = generateCertificateMetadata(certificateData);
                const metadataResult = await pinata.pinJSONToIPFS(metadata);

                results.push({
                    studentId: studentData.studentId,
                    ipfsHash: metadataResult.IpfsHash,
                    fileHash: fileResult.IpfsHash,
                    status: 'uploaded'
                });
            } catch (error) {
                console.error(`Batch upload error for student ${students[i]?.studentId}:`, error);
                errors.push({
                    studentId: students[i]?.studentId,
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            processed: results.length,
            errors: errors.length,
            results,
            errors
        });
    } catch (error) {
        console.error('Batch upload error:', error);
        res.status(500).json({ error: 'Batch upload failed' });
    }
});

// Search certificates
app.get('/api/certificates/search', async (req, res) => {
    try {
        const { query, type } = req.query;

        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        let searchCriteria = {};

        switch (type) {
            case 'student':
                searchCriteria = {
                    $or: [
                        { studentName: { $regex: query, $options: 'i' } },
                        { studentId: { $regex: query, $options: 'i' } },
                        { studentEmail: { $regex: query, $options: 'i' } }
                    ]
                };
                break;
            case 'course':
                searchCriteria = { courseName: { $regex: query, $options: 'i' } };
                break;
            case 'tokenId':
                searchCriteria = { tokenId: parseInt(query) };
                break;
            default:
                searchCriteria = {
                    $or: [
                        { studentName: { $regex: query, $options: 'i' } },
                        { studentId: { $regex: query, $options: 'i' } },
                        { courseName: { $regex: query, $options: 'i' } },
                        { tokenId: isNaN(query) ? -1 : parseInt(query) }
                    ]
                };
        }

        const certificates = await Certificate.find(searchCriteria)
            .populate('institutionId', 'name')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({ certificates });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// Get certificate metadata from IPFS
app.get('/api/certificates/metadata/:ipfsHash', async (req, res) => {
    try {
        const { ipfsHash } = req.params;
        
        // Fetch metadata from IPFS
        const response = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
        
        if (!response.ok) {
            return res.status(404).json({ error: 'Metadata not found' });
        }

        const metadata = await response.json();
        res.json(metadata);
    } catch (error) {
        console.error('Metadata fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch metadata' });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large' });
        }
    }
    
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Base RPC URL: ${process.env.BASE_RPC_URL}`);
    console.log(`📁 Contract Address: ${process.env.CONTRACT_ADDRESS}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    mongoose.connection.close(() => {
        console.log('💾 MongoDB connection closed');
        process.exit(0);
    });
});

module.exports = app;