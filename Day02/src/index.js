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

// Initialize Socket.io with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173", // Your React app URL
    methods: ["GET", "POST"],
    credentials: true
  }
});
app.use(cors({
    origin: 'http://localhost:5173', // frontend address
    credentials: true, // to allow cookies to be sent
}));


// Initialize Socket.io
const initializeSocket = require('./socket/socketServer');
initializeSocket(io);

// Make io accessible in routes/controllers if needed
app.set('io', io);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'LeetCode Clone API with Study Groups' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: err.message || 'Something went wrong!' 
  });
});

app.use(cookieParser());
app.use(express.json());



app.use('/user', userAuthRouter);
app.use('/problem', problemRouter);
app.use('/submission',submitRouter);
app.use('/ai',aiRouter);
app.use('/study-groups', studyGroupRouter);
app.use('/video', videoRouter);
app.use('/interview', interviewRouter);


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

