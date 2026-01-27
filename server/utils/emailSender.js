const nodemailer = require('nodemailer');
require('dotenv').config();

// Verify that environment variables are loaded
// Trim to remove accidental whitespace which causes 'BadCredentials'
const emailUser = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : '';
const emailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.trim() : '';

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

// Verify SMTP connection configuration
const verifyTransporter = async () => {
  console.log("---------------------------------------------------");
  console.log("📧 Initializing Email Service...");
  console.log(`   User: ${emailUser}`);
  console.log(`   Pass: ${emailPass ? '********' : 'NOT SET'}`);
  
  try {
    await transporter.verify();
    console.log("✅ SMTP Server is ready to send emails");
  } catch (error) {
    console.error("❌ SMTP Connection Error:", error);
    if (error.code === 'EAUTH') {
       console.error("   -> Please check EMAIL_USER and EMAIL_PASS in .env");
       console.error("   -> Ensure you are using a 16-character App Password.");
    }
  }
  console.log("---------------------------------------------------");
};

// Call verify on load
verifyTransporter();

exports.sendOTP = async (email, otp) => {
  console.log(`[SERVER LOG] Preparing to send OTP to: ${email}`);
  
  const mailOptions = {
    from: emailUser,
    to: email,
    subject: 'Your OTP for Registration',
    text: `Your OTP code is ${otp}. It expires in 5 minutes.`,
    html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
             <h2>Your OTP Code</h2>
             <p>Your OTP code is <strong style="font-size: 24px;">${otp}</strong>.</p>
             <p>It expires in 5 minutes.</p>
             <p>If you did not request this, please ignore this email.</p>
           </div>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${email}. Message ID: ${info.messageId}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message || 'Unknown SMTP Error' };
  }
};
