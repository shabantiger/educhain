const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendWelcomeEmail(institutionEmail, institutionName) {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@EDUCHAIN.ug',
        to: institutionEmail,
        subject: 'Welcome to EDUCHAIN Uganda!',
        html: `
          <h2>Welcome to EDUCHAIN Uganda!</h2>
          <p>Dear ${institutionName},</p>
          <p>Thank you for registering with EDUCHAIN Uganda. Your institution is now part of the blockchain revolution in academic credentials.</p>
          <p>Next steps:</p>
          <ul>
            <li>Your institution will be verified by our admin team</li>
            <li>Once verified, you can start issuing blockchain certificates</li>
            <li>You'll receive an email notification when verification is complete</li>
          </ul>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>EDUCHAIN Uganda Team</p>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Email sending error:', error);
      throw new Error(`Failed to send welcome email: ${error.message}`);
    }
  }

  async sendVerificationEmail(institutionEmail, institutionName) {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@EDUCHAIN.ug',
        to: institutionEmail,
        subject: 'Institution Verified - EDUCHAIN Uganda',
        html: `
          <h2>Congratulations! Your Institution is Verified</h2>
          <p>Dear ${institutionName},</p>
          <p>Great news! Your institution has been successfully verified on EDUCHAIN Uganda.</p>
          <p>You can now:</p>
          <ul>
            <li>Issue blockchain-based academic certificates</li>
            <li>Manage your certificates through the dashboard</li>
            <li>Provide students with tamper-proof credentials</li>
          </ul>
          <p><a href="${process.env.FRONTEND_URL}/dashboard">Login to your dashboard</a> to get started.</p>
          <p>Best regards,<br>EDUCHAIN Uganda Team</p>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Email sending error:', error);
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
  }

  async sendCertificateIssuedEmail(studentEmail, studentName, certificateData) {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@EDUCHAIN.ug',
        to: studentEmail,
        subject: 'Your Digital Certificate is Ready!',
        html: `
          <h2>Your Digital Certificate is Ready!</h2>
          <p>Dear ${studentName},</p>
          <p>Congratulations! Your digital certificate has been issued on the blockchain.</p>
          <p><strong>Certificate Details:</strong></p>
          <ul>
            <li>Course: ${certificateData.courseName}</li>
            <li>Grade: ${certificateData.grade}</li>
            <li>Institution: ${certificateData.institutionName}</li>
            <li>Token ID: #${certificateData.tokenId}</li>
          </ul>
          <p><a href="${process.env.FRONTEND_URL}/verify/${certificateData.tokenId}">View your certificate</a></p>
          <p>Your certificate is now permanently stored on the blockchain and can be verified by anyone, anywhere in the world.</p>
          <p>Best regards,<br>EDUCHAIN Uganda Team</p>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Email sending error:', error);
      throw new Error(`Failed to send certificate email: ${error.message}`);
    }
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      return { success: true, message: 'Email service connection successful' };
    } catch (error) {
      console.error('Email connection test failed:', error);
      throw new Error(`Email connection failed: ${error.message}`);
    }
  }
}

const emailService = new EmailService();

module.exports = {
  sendWelcomeEmail: (email, name) => emailService.sendWelcomeEmail(email, name),
  sendVerificationEmail: (email, name) => emailService.sendVerificationEmail(email, name),
  sendCertificateIssuedEmail: (email, name, data) => emailService.sendCertificateIssuedEmail(email, name, data),
  testConnection: () => emailService.testConnection()
};
