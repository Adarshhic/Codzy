const prisma = require('../config/prisma');
const validate = require('../utils/validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');
const { generateId } = require('../utils/idGenerator');

const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure: isProduction,             // HTTPS required in production for SameSite=None
    sameSite: isProduction ? 'none' : 'lax'
  };
};

// Register User
const register = async (req, res) => {
  try {
    // 1. Validate input
    validate(req.body);

    const { FirstName, LastName, EmailId, password, age } = req.body;
    const normalizedEmail = EmailId.toLowerCase().trim();

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { EmailId: normalizedEmail }
    });
    if (existingUser) {
      return res.status(409).json({
        message: 'User already exists with this EmailId'
      });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user with preserved 24-char hex string ID format
    const user = await prisma.user.create({
      data: {
        id: generateId(),
        FirstName,
        LastName: LastName || null,
        EmailId: normalizedEmail,
        age: age ? parseInt(age, 10) : null,
        password: hashedPassword,
        role: 'User'
      }
    });

    // 5. Generate JWT
    const token = jwt.sign(
      { _id: user.id, EmailId: user.EmailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: '7d' }
    );

    // 6. Set secure cookie
    res.cookie('token', token, getCookieOptions());

    // 7. Send safe response
    res.status(201).json({
      message: 'User Registered Successfully',
      token,
      user: {
        _id: user.id,
        id: user.id,
        FirstName: user.FirstName,
        EmailId: user.EmailId,
        role: user.role
      }
    });

  } catch (err) {
    if (err.code === 'P2002' || err.code === 11000) {
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

    if (!EmailId || !password) {
      return res.status(400).json({
        message: 'EmailId and password are required'
      });
    }

    const normalizedEmail = EmailId.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { EmailId: normalizedEmail }
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid EmailId or password'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid EmailId or password'
      });
    }

    const token = jwt.sign(
      { _id: user.id, EmailId: user.EmailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, getCookieOptions());

    res.status(200).json({
      message: 'Login Successful',
      token,
      user: {
        _id: user.id,
        id: user.id,
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
    const token = req.cookies?.token || (req.headers?.authorization ? req.headers.authorization.replace(/^Bearer\s+/i, '') : null);
    if (token) {
      try {
        const payload = jwt.decode(token);
        if (payload && payload.exp) {
          await redisClient.set(`token:${token}`, 'blocked');
          await redisClient.expireAt(`token:${token}`, payload.exp);
        }
      } catch (redisErr) {
        console.warn('Redis logout blacklist warning:', redisErr.message);
      }
    }

    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax'
    });
    res.status(200).json({ message: 'Logout Successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin Register User
const adminRegister = async (req, res) => {
  try {
    validate(req.body);

    const { FirstName, LastName, EmailId, password, age } = req.body;
    const normalizedEmail = EmailId.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { EmailId: normalizedEmail }
    });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        id: generateId(),
        FirstName,
        LastName: LastName || null,
        EmailId: normalizedEmail,
        age: age ? parseInt(age, 10) : null,
        password: hashedPassword,
        role: 'Admin'
      }
    });

    const token = jwt.sign(
      { _id: user.id, EmailId: user.EmailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, getCookieOptions());

    res.status(201).json({
      message: 'Admin Registered Successfully',
      token,
      user: {
        _id: user.id,
        id: user.id,
        EmailId: user.EmailId,
        role: user.role
      }
    });

  } catch (err) {
    if (err.code === 'P2002' || err.code === 11000) {
      return res.status(409).json({ message: 'EmailId already registered' });
    }
    res.status(400).json({ message: err.message });
  }
};

const deleteProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    // With ON DELETE CASCADE in PostgreSQL, deleting the user automatically cascades to submissions, etc.
    await prisma.user.delete({
      where: { id: userId }
    });

    res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, logout, adminRegister, deleteProfile };