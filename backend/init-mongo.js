// MongoDB initialization script
db = db.getSiblingDB('academic_certificates');

// Create collections
db.createCollection('institutions');
db.createCollection('certificates');

// Create indexes
db.institutions.createIndex({ email: 1 }, { unique: true });
db.institutions.createIndex({ walletAddress: 1 }, { unique: true });
db.institutions.createIndex({ registrationNumber: 1 }, { unique: true });

db.certificates.createIndex({ tokenId: 1 }, { unique: true });
db.certificates.createIndex({ studentId: 1 });
db.certificates.createIndex({ institutionId: 1 });
db.certificates.createIndex({ transactionHash: 1 });

print('Database initialized successfully');
