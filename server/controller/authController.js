const { prisma } = require('../utils/dbConnector');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTP } = require('../utils/emailSender');

require('dotenv').config()

// Strict password validation regex
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;

const buildCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production'
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 6 * 60 * 60 * 1000
  }
}

const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("Generated OTP:", otp);
  return otp;
};

exports.adminRegister = async (req, res) => {
  const { name, role, email, pass } = req.body
  
  // Strict password validation
  if (!PASSWORD_REGEX.test(pass)) {
    return res.status(400).send({ 
      message: 'Password must be at least 6 characters with at least 1 uppercase, 1 lowercase, 1 number, and 1 special character (!@#$%^&*)', 
      status: false 
    });
  }
  
  const hashPassword = await bcrypt.hash(pass, 10)//10 salts of hashing
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  try {
    const existingUser = await prisma.User.findFirst({ where: { email } });
    if (existingUser) {
      return res.status(400).send({ message: 'User already exists', status: false });
    }

    const emailResult = await sendOTP(email, otp);
    
    if (!emailResult.success) {
      return res.status(500).send({ message: 'Failed to send OTP email: ' + emailResult.error, status: false });
    }

    const UserData = await prisma.User.create({
      data: {
        name,
        email,
        role,
        pass: hashPassword,
        otp,
        otpExpiry,
        isVerified: false
      }
    });

    res.status(201).send({ message: 'OTP sent to email', status: true, email: UserData.email })
  } catch (err) {
    res.status(400).send({ message: err.message, status: false })
  }
}

exports.adminLogin = async (req, res) => {
  const { email, pass, role } = req.body;
  try {
    const validUser = await prisma.User.findFirst({
      where: { email: email, role: 'admin' }
    });

    if (!validUser)
      return res.status(401).json({ message: "Admin doesn't exist" });

    const validPass = await bcrypt.compare(pass, validUser.pass);
    if (!validPass)
      return res.status(401).json({ message: "Wrong Password" });

    // Generate and send OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.User.update({
      where: { id: validUser.id },
      data: { otp, otpExpiry }
    });

    const emailResult = await sendOTP(email, otp);
    
    if (!emailResult.success) {
       return res.status(500).json({ message: 'Failed to send OTP email: ' + emailResult.error });
    }

    res.status(200).json({ message: "OTP sent to email", email: email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.userLogin = async (req, res) => {
  const { email, pass } = req.body;
  try {
    const validUser = await prisma.User.findFirst({
      where: { email: email, role: 'user' },
    });

    if (!validUser)
      return res.status(400).json({ message: "User doesn't exist" });

    if (!validUser.isVerified) {
      return res.status(400).json({ message: "User not verified. Please complete registration." });
    }

    const validPass = await bcrypt.compare(pass, validUser.pass);

    if (!validPass)
      return res.status(400).json({ message: 'Wrong Password' });

    // Generate and send OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.User.update({
      where: { id: validUser.id },
      data: { otp, otpExpiry }
    });

    const emailResult = await sendOTP(email, otp);
    
    if (!emailResult.success) {
      return res.status(500).json({ message: 'Failed to send OTP email: ' + emailResult.error });
    }

    return res.status(200).send({ message: 'OTP sent to email', email: email });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
}

exports.userRegister = async (req, res) => {
  const { name, email, pass } = req.body;
  console.log(req.body);
  
  // Strict password validation
  if (!PASSWORD_REGEX.test(pass)) {
    return res.status(400).json({ 
      status: false, 
      message: 'Password must be at least 6 characters with at least 1 uppercase, 1 lowercase, 1 number, and 1 special character (!@#$%^&*)' 
    });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.User.findFirst({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ status: false, message: 'User already exists' });
    }

    // Hash the password before saving
    const hashedPass = await bcrypt.hash(pass, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    const emailResult = await sendOTP(email, otp);

    if (!emailResult.success) {
       return res.status(500).json({ status: false, message: 'Failed to send OTP email: ' + emailResult.error });
    }

    // Create user in DB with isVerified = false
    const userData = await prisma.User.create({
      data: {
        name,
        email,
        role: 'user',
        pass: hashedPass,
        otp,
        otpExpiry,
        isVerified: false
      }
    });

    return res.status(201).json({
      status: true,
      message: 'OTP sent to email',
      email: userData.email,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await prisma.User.findFirst({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > new Date(user.otpExpiry)) {
      return res.status(400).json({ message: "OTP Expired" });
    }

    // OTP is valid
    await prisma.User.update({
      where: { id: user.id },
      data: {
        otp: null,
        otpExpiry: null,
        isVerified: true
      }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET_TOKEN,
      { expiresIn: '6h' }
    );

    res
      .cookie('token', token, buildCookieOptions())
      .status(200)
      .json({ message: "Verification Successful", token, role: user.role });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.adminChangePass = async (req, res) => {
  const adminId = req.params.id;
  const { newPass } = req.body;
  
  // Strict password validation
  if (!PASSWORD_REGEX.test(newPass)) {
    return res.status(400).send({ 
      status: false, 
      message: 'Password must be at least 6 characters with at least 1 uppercase, 1 lowercase, 1 number, and 1 special character (!@#$%^&*)' 
    });
  }
  
  try {
    // Hash the password after validation passes
    const hashedPass = await bcrypt.hash(newPass, 10);
    const updateData = await prisma.User.update({
      where: { id: adminId },
      data: { pass: hashedPass }
    })
    res.status(201).send({ status: true, message: updateData });
  } catch (err) {
    res.status(400).send({ status: false, message: err });
  }
}

exports.userLogout = (req, res) => {
  const options = buildCookieOptions()
  res.clearCookie('token', {
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite
  })
  return res.status(200).send({ status: true, message: 'Logged out successfully' })
}

exports.adminLogout = (req, res) => {
  const options = buildCookieOptions()
  res.clearCookie('token', {
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite
  })
  return res.status(200).send({ status: true, message: 'Logged out successfully' })
}
