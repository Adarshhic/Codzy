const { StreamClient } = require('@stream-io/node-sdk');
const { StreamChat } = require('stream-chat');

// Initialize Stream Video Client
const streamClient = new StreamClient(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

// Initialize Stream Chat Client
const chatClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

module.exports = { streamClient, chatClient };