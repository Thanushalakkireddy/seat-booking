const {prisma }= require('../utils/dbConnector');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config()

const buildCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production'
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 6 * 60 * 60 * 1000
  }
}

exports.adminRegister= async (req,res)=>{
    const {name,role,email,pass} = req.body
    const hashPassword = await bcrypt.hash(pass,10)//10 salts of hashing
    try{
    const UserData  = await prisma.User.create({
        data:{
            name,
            email,
            role,
            pass:hashPassword
        }
    });
    res.status(201).send({message:'created admin',status:true,data:UserData})
    }catch(err){
       res.status(400).send({message:err,status:false})
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

        const token = jwt.sign(
            { id: validUser.id, email: email, role: 'admin' },
            process.env.JWT_SECRET_TOKEN,
            { expiresIn: '6h' }
        );

        res
          .cookie('token', token, buildCookieOptions())
          .status(200)
          .json({ message: "Login Successful", token });
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

    const validPass = await bcrypt.compare(pass, validUser.pass);

    if (!validPass)
      return res.status(400).json({ message: 'Wrong Password' });

    const token = jwt.sign(
      { id: validUser.id, email: email, role: 'user' },
      process.env.JWT_SECRET_TOKEN,
      { expiresIn: '6h' }
    );

    return res
      .cookie('token', token, buildCookieOptions())
      .status(200)
      .send({ message: 'Login Successful', token });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
}

exports.userRegister = async (req, res) => {
  const { name, email, pass } = req.body;
  console.log(req.body);

  try {
    // Check if user already exists
    const existingUser = await prisma.User.findFirst({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ status: false, message: 'User already exists' });
    }

    // Hash the password before saving
    const hashedPass = await bcrypt.hash(pass, 10);

    // Create new user
    const userData = await prisma.User.create({
      data: {
        name,
        email,
        pass: hashedPass,
        role: 'user',
      },
    });

    return res.status(201).json({
      status: true,
      message: 'User registered successfully',
      data: { id: userData.id, name: userData.name, email: userData.email },
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.adminChangePass = async (req,res)=>{
    const adminId = req.params.id;
    const {newPass} = req.body;
    console.log(newPass);
    try{
        const updateData = await prisma.User.update({
         where:{id:adminId},
         data:{pass:newPass}
        })
         res.status(201).send({status:true,message:updateData});
    }catch(err){
         res.status(400).send({status:false,message:err});
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
