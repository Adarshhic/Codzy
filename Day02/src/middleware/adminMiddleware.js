const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
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
    const userId = payload._id || payload.id;

    if (!userId) {
      return res.status(401).json({
        message: 'Unauthorized: Invalid token'
      });
    }

    if (payload.role !== 'Admin') {
      return res.status(403).json({
        message: 'Forbidden: Admin access only'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        FirstName: true,
        LastName: true,
        EmailId: true,
        age: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized: User doesn't exist"
      });
    }

    req.user = {
      ...user,
      _id: user.id
    };

    next();
  } catch (err) {
    return res.status(401).json({
      message: 'Unauthorized: ' + (err.message || 'Invalid token')
    });
  }
};

module.exports = adminMiddleware;