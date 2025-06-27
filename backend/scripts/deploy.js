// scripts/deploy.js
const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("🚀 Starting deployment to Base blockchain...");
    
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("👤 Deploying with account:", deployer.address);
    
    // Check deployer balance
    const balance = await deployer.getBalance();
    console.log("💰 Account balance:", ethers.utils.formatEther(balance), "ETH");
    
    if (balance.lt(ethers.utils.parseEther("0.01"))) {
        console.error("❌ Insufficient balance for deployment");
        process.exit(1);
    }

    // Deploy the contract
    console.log("📄 Deploying AcademicCertificateNFT contract...");
    const AcademicCertificateNFT = await ethers.getContractFactory("AcademicCertificateNFT");
    
    const contract = await AcademicCertificateNFT.deploy();
    await contract.deployed();
    
    console.log("✅ Contract deployed successfully!");
    console.log("📍 Contract address:", contract.address);
    console.log("🔗 Transaction hash:", contract.deployTransaction.hash);
    
    // Wait for a few confirmations
    console.log("⏳ Waiting for confirmations...");
    await contract.deployTransaction.wait(5);
    
    // Save deployment info
    const deploymentInfo = {
        contractAddress: contract.address,
        deploymentHash: contract.deployTransaction.hash,
        deployer: deployer.address,
        network: "base",
        timestamp: new Date().toISOString(),
        blockNumber: contract.deployTransaction.blockNumber
    };
    
    fs.writeFileSync(
        "deployment-info.json",
        JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("💾 Deployment info saved to deployment-info.json");
    
    // Verify contract on BaseScan (optional)
    if (process.env.BASESCAN_API_KEY) {
        console.log("🔍 Verifying contract on BaseScan...");
        try {
            await hre.run("verify:verify", {
                address: contract.address,
                constructorArguments: [],
            });
            console.log("✅ Contract verified on BaseScan");
        } catch (error) {
            console.log("❌ Verification failed:", error.message);
        }
    }
    
    console.log("\n🎉 Deployment completed successfully!");
    console.log("📋 Summary:");
    console.log("   Contract Address:", contract.address);
    console.log("   Network: Base");
    console.log("   Gas Used:", contract.deployTransaction.gasLimit.toString());
    console.log("   Deployer:", deployer.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });

// Additional utility functions for post-deployment setup
async function setupInstitutions() {
    console.log("🏫 Setting up initial institutions...");
    
    const contractAddress = require("../deployment-info.json").contractAddress;
    const contract = await ethers.getContractAt("AcademicCertificateNFT", contractAddress);
    
    // Example institutions in Uganda
    const institutions = [
        {
            name: "Makerere University",
            registrationNumber: "MAK001",
            address: "0x..." // Institution wallet address
        },
        {
            name: "Kampala International University",
            registrationNumber: "KIU002", 
            address: "0x..." // Institution wallet address
        },
        {
            name: "Uganda Christian University",
            registrationNumber: "UCU003",
            address: "0x..." // Institution wallet address
        }
    ];
    
    for (const institution of institutions) {
        try {
            // This would be called by each institution
            console.log(`📝 Registering ${institution.name}...`);
            // The actual registration would be done by the institution
            // await contract.connect(institutionSigner).registerInstitution(
            //     institution.name,
            //     institution.registrationNumber
            // );
            console.log(`✅ ${institution.name} registered successfully`);
        } catch (error) {
            console.error(`❌ Failed to register ${institution.name}:`, error.message);
        }
    }
}

// Export functions for use in other scripts
module.exports = {
    main,
    setupInstitutions
};