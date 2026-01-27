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
const cors = require('cors');

app.use(cors({
    origin: 'http://localhost:5173', // frontend address
    credentials: true, // to allow cookies to be sent
}));




app.use(cookieParser());
app.use(express.json());



app.use('/user', userAuthRouter);

app.use('/problem', problemRouter);
app.use('/submission',submitRouter);
app.use('/ai',aiRouter);
app.use('/video', videoRouter);


const initializeConnections = async () => {
  try {
    await Promise.all([
      main(),                 // MongoDB
      redisClient.connect()   // Redis
    ]);

    console.log('Connected to Database and Redis successfully');

    app.listen(process.env.PORT, () => {
      console.log('Server running at port', process.env.PORT);
    });

  } catch (err) {
    console.error('Error initializing connections:', err);
    process.exit(1);
  }
};

initializeConnections();

// main().then(() => {
// app.listen(process.env.PORT, () => {
//     console.log('server running at port', process.env.PORT);
// });
// }).catch((err) => {
//     console.log('Failed to connect to the database', err);
// });