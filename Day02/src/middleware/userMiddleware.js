const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const redisClient = require('../config/redis');

const userMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = req.cookies?.token || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader);

    if (!token) {
      return res.status(401).json({
        message: 'Unauthorized: No token provided'
      });
    }

    // 1️⃣ Check Redis blacklist
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
      console.warn('Redis check error in userMiddleware:', redisErr.message);
    }

    // 2️⃣ Verify JWT
    const payload = jwt.verify(token, process.env.JWT_KEY);
    const userId = payload._id || payload.id;

    if (!userId) {
      return res.status(401).json({
        message: 'Unauthorized: Invalid token'
      });
    }

    // 3️⃣ Fetch user from PostgreSQL
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
        message: 'Unauthorized: User not found'
      });
    }

    // 4️⃣ Attach user to request (including _id for backward compatibility)
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

module.exports = userMiddleware;
module.exports.verifyToken = userMiddleware;
