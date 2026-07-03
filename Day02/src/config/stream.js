const { StreamClient } = require('@stream-io/node-sdk');
const { StreamChat } = require('stream-chat');

// Load environment variables
require('dotenv').config();

// Initialize Stream Video Client (for backend)
const streamClient = process.env.STREAM_API_KEY && process.env.STREAM_API_SECRET
  ? new StreamClient(
      process.env.STREAM_API_KEY,
      process.env.STREAM_API_SECRET
    )
  : null;

// Initialize Stream Chat Client (for backend)
const chatClient = process.env.STREAM_API_KEY && process.env.STREAM_API_SECRET
  ? StreamChat.getInstance(
      process.env.STREAM_API_KEY,
      process.env.STREAM_API_SECRET
    )
  : null;

// Validation check
if (!streamClient || !chatClient) {
  console.error('⚠️ WARNING: Stream.io credentials not configured!');
  console.error('Please set STREAM_API_KEY and STREAM_API_SECRET in your .env file');
  console.error('Interview features will not work without Stream.io configuration');
} else {
  console.log('✅ Stream.io clients initialized successfully');
}

module.exports = {
  streamClient,
  chatClient
};