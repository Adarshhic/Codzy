const User = require('../models/user');
const validate = require('../utils/validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');
const Submission = require('../models/Submission');

// Register User

const register = async (req, res) => {
 try {
    // 1. Validate input
     validate(req.body);

    const { EmailId, password } = req.body;

    // 2. Check if user already exists
    const existingUser = await User.findOne({ EmailId });
    if (existingUser) {
      return res.status(409).json({
        message: 'User already exists with this EmailId'
      });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    req.body.password = hashedPassword;

    // 4. Set role
    req.body.role = 'User';

    // 5. Create user
    const user = await User.create(req.body);

    // 6. Generate JWT
    const token = jwt.sign(
      { _id: user._id, EmailId: user.EmailId , role: user.role},
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );

    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax'
    };

    // 7. Set secure cookie
    res.cookie('token', token, cookieOptions);

    // 8. Send safe response
    res.status(201).json({
      message: 'User Registered Successfully',
      user: {
         _id: user._id,
        FirstName: user.FirstName,
        EmailId: user.EmailId,
        role: user.role
      }
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: 'EmailId already registered'
      });
    }
    res.status(400).json({ message: err.message });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const { EmailId, password } = req.body;

    // 1. Validate input
    if (!EmailId || !password) {
      return res.status(400).json({
        message: 'EmailId and password are required'
      });
    }

    // 2. Find user
    const user = await User.findOne({ EmailId });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid EmailId or password'
      });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid EmailId or password'
      });
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { _id: user._id, EmailId: user.EmailId , role: user.role },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );

    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax'
    };

    // 5. Set secure cookie
    res.cookie('token', token, cookieOptions);

    // 6. Send safe response
    res.status(200).json({
      message: 'Login Successful',
      user: {
        _id: user._id,
        FirstName: user.FirstName,
        EmailId: user.EmailId,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Logout User
const logout = async (req, res) => { 
  try {
    const { token } = req.cookies;
    if (token) {
      try {
        const payload = jwt.decode(token);   
        await redisClient.set(`token:${token}`, 'blocked');
        if (payload?.exp) {
          await redisClient.expireAt(`token:${token}`, payload.exp);
        }
      } catch (redisErr) {
        console.error('Redis logout error:', redisErr.message);
      }
    }

    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('token', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax'
    });
    return res.status(200).json({ message: 'Logout Successful' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Admin Register User
const adminRegister = async (req, res) => {
  try {
    // 1. Validate input
    validate(req.body);

    const { EmailId, password } = req.body;

    // 2. Check existing user
    const existingUser = await User.findOne({ EmailId });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // 3. Hash password
    req.body.password = await bcrypt.hash(password, 10);

    // 4. Force admin role
    req.body.role = 'Admin';

    // 5. Create admin
    const user = await User.create(req.body);

    // 6. Generate JWT
    const token = jwt.sign(
      { _id: user._id, EmailId: user.EmailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );

    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax'
    };

    // 7. Set cookie
    res.cookie('token', token, cookieOptions);

    res.status(201).json({
      message: 'Admin Registered Successfully',
      user: {
        _id: user._id,
        EmailId: user.EmailId,
        role: user.role
      }
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    await User.findByIdAndDelete(userId);

    await Submission.deleteMany({ userId: userId });
    
    res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports = {register,login,logout,adminRegister,deleteProfile};