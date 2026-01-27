const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// 1. Manually read .env to check for hidden characters/whitespace
const envPath = path.join(__dirname, '.env');
console.log(`Loading .env from: ${envPath}`);
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const emailUser = envConfig.EMAIL_USER;
const emailPass = envConfig.EMAIL_PASS;

console.log("---------------------------------------------------");
console.log("📧 Email Configuration Verification Script");
console.log("---------------------------------------------------");
console.log(`User (Raw): '${emailUser}'`);
console.log(`Pass (Raw): '${emailPass ? emailPass.replace(/./g, '*') : 'Not Set'}'`);
console.log(`Pass Length: ${emailPass ? emailPass.length : 0}`);

if (!emailUser || !emailPass) {
    console.error("❌ ERROR: Credentials missing in .env");
    process.exit(1);
}

// Check for common whitespace issues
if (emailUser.trim() !== emailUser || emailPass.trim() !== emailPass) {
    console.warn("⚠️  WARNING: Detected leading/trailing whitespace in credentials!");
    console.warn("   This often causes 'BadCredentials' errors.");
    console.warn("   We will try to trim them for this test.");
}

const cleanUser = emailUser.trim();
const cleanPass = emailPass.trim();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: cleanUser,
        pass: cleanPass,
    },
});

async function verifyAndSend() {
    console.log("\n1️⃣  Testing SMTP Connection...");
    try {
        await transporter.verify();
        console.log("✅ SMTP Connection Successful!");
    } catch (error) {
        console.error("❌ SMTP Connection Failed:");
        console.error(error);
        if (error.code === 'EAUTH') {
             console.log("\n🔴 DIAGNOSIS: Authentication Failed");
             console.log("   - Verify 'EMAIL_PASS' is a valid 16-character App Password.");
             console.log("   - Verify 'EMAIL_USER' is the correct Gmail address.");
             console.log("   - Ensure 2-Step Verification is ON for this account.");
        }
        return;
    }

    console.log("\n2️⃣  Sending Test Email...");
    try {
        const info = await transporter.sendMail({
            from: cleanUser,
            to: cleanUser, // Send to self
            subject: 'Test Email from BookMyShow Project',
            text: 'If you see this, email sending is working correctly!',
        });
        console.log("✅ Test Email Sent Successfully!");
        console.log("Message ID:", info.messageId);
    } catch (error) {
        console.error("❌ Test Email Failed:");
        console.error(error);
    }
}

verifyAndSend();
