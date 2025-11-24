import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn('Email service not configured. Emails will be logged only.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const transporter = createTransporter();

export const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@placedai.com',
    to: email,
    subject: 'Your PlacedAI Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to PlacedAI</h2>
        <p>Your verification code is:</p>
        <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `
  };

  // If email service is not configured, use mock mode (don't throw error)
  if (!transporter) {
    console.log(`[MOCK EMAIL] OTP for ${email}: ${otp}`);
    console.log(`[MOCK EMAIL] In production, configure SMTP settings in .env to send real emails`);
    return; // Successfully "sent" in mock mode
  }

  // Try to send real email
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✓ OTP email sent to ${email}`);
  } catch (error) {
    console.error('✗ Error sending OTP email:', error.message);
    // If email fails but we have OTP stored, log it for development
    console.log(`[FALLBACK] OTP for ${email}: ${otp} (email service failed, but OTP is valid)`);
    // Don't throw error - allow OTP to work even if email fails
    // The OTP is still stored in database and can be verified
  }
};

export const sendRecruiterOptInEmail = async (candidateEmail, recruiterName, companyName, jobTitle, message) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@placedai.com',
    to: candidateEmail,
    subject: `New Job Opportunity: ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Job Opportunity</h2>
        <p>Hello,</p>
        <p><strong>${recruiterName}</strong> from <strong>${companyName}</strong> is interested in connecting with you about a <strong>${jobTitle}</strong> position.</p>
        ${message ? `<p><em>"${message}"</em></p>` : ''}
        <p>Log in to your PlacedAI dashboard to view and respond to this opportunity.</p>
        <a href="${process.env.FRONTEND_URL}/dashboard/optins" style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
          View Request
        </a>
      </div>
    `
  };

  if (transporter) {
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Opt-in email sent to ${candidateEmail}`);
    } catch (error) {
      console.error('Error sending opt-in email:', error);
      throw error;
    }
  } else {
    console.log(`[MOCK EMAIL] Opt-in request sent to ${candidateEmail} from ${recruiterName}`);
  }
};

export const sendOptInAcceptedEmail = async (recruiterEmail, candidateName, note) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@placedai.com',
    to: recruiterEmail,
    subject: 'Candidate Accepted Your Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Great News!</h2>
        <p><strong>${candidateName}</strong> has accepted your opt-in request.</p>
        ${note ? `<p><em>"${note}"</em></p>` : ''}
        <p>You can now view their profile and interview results in your dashboard.</p>
        <a href="${process.env.FRONTEND_URL}/recruiter/candidates" style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
          View Candidate
        </a>
      </div>
    `
  };

  if (transporter) {
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Acceptance email sent to ${recruiterEmail}`);
    } catch (error) {
      console.error('Error sending acceptance email:', error);
      throw error;
    }
  } else {
    console.log(`[MOCK EMAIL] Acceptance notification sent to ${recruiterEmail}`);
  }
};

export const sendContactNotification = async ({ name, email, subject, message, ticketId }) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM || 'admin@placedai.com';
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@placedai.com',
    to: adminEmail,
    subject: `New Support Ticket: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Support Ticket Received</h2>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          ${ticketId ? `<p><strong>Ticket ID:</strong> ${ticketId}</p>` : ''}
        </div>
        <div style="background: #fff; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
          <h3>Message:</h3>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/support" style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
          View in Admin Dashboard
        </a>
      </div>
    `
  };

  if (transporter) {
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Contact notification sent to admin (${adminEmail})`);
    } catch (error) {
      console.error('Error sending contact notification:', error);
      // Don't throw error - allow ticket creation even if email fails
      console.log(`[FALLBACK] Support ticket created: ${name} - ${subject} (email notification failed)`);
    }
  } else {
    console.log(`[MOCK EMAIL] Support ticket notification: ${name} - ${subject}`);
    console.log(`[MOCK EMAIL] Ticket ID: ${ticketId || 'N/A'}`);
    console.log(`[MOCK EMAIL] Message: ${message.substring(0, 100)}...`);
  }
};

