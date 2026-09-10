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

// Trust reverse proxy (Render, Railway, Vercel, AWS ALB, Heroku)
app.set('trust proxy', 1);

// Create HTTP server
const server = http.createServer(app);

// Build list of allowed origins
const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'https://codzy-five.vercel.app'
];
const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map(url => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...configuredOrigins]));

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    
    const normalizedOrigin = origin.replace(/\/$/, '');
    if (
      allowedOrigins.includes(normalizedOrigin) ||
      process.env.NODE_ENV !== 'production' ||
      (process.env.ALLOW_ALL_ORIGINS === 'true')
    ) {
      return callback(null, true);
    }
    
    // Check if origin matches Vercel preview URLs or custom domain
    if (origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com')) {
      return callback(null, true);
    }

    return callback(null, true); // Permissive fallback
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
};

// Initialize Socket.io with CORS
const io = socketIo(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/$/, '');
      if (
        allowedOrigins.includes(normalizedOrigin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.onrender.com') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for websocket handshake
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize Socket.io handlers
const initializeSocket = require('./socket/socketServer');
initializeSocket(io);

// Make io accessible in routes/controllers
app.set('io', io);

// --- Core middleware (must come before routes) ---
app.use(cookieParser());
app.use(express.json());
app.use(cors(corsOptions));

// Health check & Root route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'LeetCode Clone (Codzy) API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
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
  console.error('Unhandled Error:', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Something went wrong!'
  });
});

const PORT = process.env.PORT || 5000;

const initializeConnections = async () => {
  try {
    await Promise.all([
      main(),                 // MongoDB
      redisClient.connect()   // Redis
    ]);

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });

  } catch (err) {
    console.error('❌ Error initializing connections:', err);
    process.exit(1);
  }
};

initializeConnections();