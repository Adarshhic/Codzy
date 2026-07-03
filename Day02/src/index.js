const express = require('express');
const app = express();
require('dotenv').config();
const main = require('./config/db');
const redisClient = require('./config/redis');
const cookieParser = require('cookie-parser');
const userAuthRouter = require('./routes/userAuth');
const problemRouter = require('./routes/problemCreator');
const submitRouter = require('./routes/submit');
const aiRouter = require('./routes/aiChatting');
const videoRouter = require('./routes/videoCreator');
const studyGroupRouter = require('./routes/studyGroup');
const interviewRouter = require('./routes/interview');
const cors = require('cors');
const socketIo = require('socket.io');

const http = require('http');

// Create HTTP server
const server = http.createServer(app);

// Allowed origins for CORS (local dev + deployed frontend)
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL // e.g. https://codzy.vercel.app
].filter(Boolean); // removes undefined if CLIENT_URL isn't set yet

// Initialize Socket.io with CORS
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Initialize Socket.io
const initializeSocket = require('./socket/socketServer');
initializeSocket(io);

// Make io accessible in routes/controllers if needed
app.set('io', io);

// --- Core middleware (must come before routes) ---
app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: allowedOrigins,
    credentials: true, // to allow cookies to be sent
}));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'LeetCode Clone API with Study Groups' });
});

// --- Routes ---
app.use('/user', userAuthRouter);
app.use('/problem', problemRouter);
app.use('/submission', submitRouter);
app.use('/ai', aiRouter);
app.use('/study-groups', studyGroupRouter);
app.use('/video', videoRouter);
app.use('/interview', interviewRouter);

// --- Error handling middleware (must be last) ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Something went wrong!'
  });
});

const initializeConnections = async () => {
  try {
    await Promise.all([
      main(),                 // MongoDB
      redisClient.connect()   // Redis
    ]);

    server.listen(process.env.PORT, () => {
      console.log('Server running at port', process.env.PORT);
    });

  } catch (err) {
    console.error('Error initializing connections:', err);
    process.exit(1);
  }
};

initializeConnections();