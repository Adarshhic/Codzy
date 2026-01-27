const jwt = require('jsonwebtoken');
const User = require('../models/user');
const redisClient = require('../config/redis');

const adminMiddleware = async (req, res, next) => {
  try {
    
  
    const { token } = req.cookies;

    if (!token)
      throw new Error("Token is not present");

    const payload = jwt.verify(token, process.env.JWT_KEY);
    const { _id } = payload;

    if (!_id)
      throw new Error("Invalid token");

    const result = await User.findById(_id);
    


    if (payload.role !== 'Admin')
      throw new Error("Admin access only");

    if (!result)
      throw new Error("User doesn't exist");

    const isBlocked = await redisClient.exists(`token:${token}`);
    if (isBlocked)
      throw new Error("Token is blocked");

    // 🔥 MOST IMPORTANT FIX
    req.user = result;

    next();
  } catch (err) {
    return res.status(401).json({
      message: 'Unauthorized: ' + err.message
    });
  }
};

module.exports = adminMiddleware;