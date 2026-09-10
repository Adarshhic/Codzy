const jwt = require('jsonwebtoken');
const User = require('../models/user');
const redisClient = require('../config/redis');

const adminMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = req.cookies?.token || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader);

    if (!token) {
      return res.status(401).json({
        message: 'Unauthorized: Token is not present'
      });
    }

    try {
      if (redisClient.isOpen) {
        const isBlocked = await redisClient.exists(`token:${token}`);
        if (isBlocked) {
          return res.status(401).json({
            message: 'Unauthorized: Token is blocked'
          });
        }
      }
    } catch (redisErr) {
      console.warn('Redis check error in adminMiddleware:', redisErr.message);
    }

    const payload = jwt.verify(token, process.env.JWT_KEY);
    const { _id } = payload;

    if (!_id) {
      return res.status(401).json({
        message: 'Unauthorized: Invalid token'
      });
    }

    if (payload.role !== 'Admin') {
      return res.status(403).json({
        message: 'Forbidden: Admin access only'
      });
    }

    const result = await User.findById(_id).select('-password');
    if (!result) {
      return res.status(401).json({
        message: "Unauthorized: User doesn't exist"
      });
    }

    req.user = result;

    next();
  } catch (err) {
    return res.status(401).json({
      message: 'Unauthorized: ' + (err.message || 'Invalid token')
    });
  }
};

module.exports = adminMiddleware;