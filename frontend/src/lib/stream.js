import { StreamVideoClient } from '@stream-io/video-react-sdk';
import { StreamChat } from 'stream-chat';

/**
 * Initialize Stream Video and Chat clients
 * @param {string} userId - User ID from your authentication
 * @param {string} userName - User's display name
 * @param {string} token - Stream token from backend
 * @returns {Object} - Object containing videoClient and chatClient
 */
export const initializeStreamClients = async (userId, userName, token) => {
  try {
    if (!userId || !token) {
      throw new Error('User ID and token are required to initialize Stream clients');
    }

    const apiKey = import.meta.env.VITE_STREAM_API_KEY;
    
    if (!apiKey) {
      throw new Error('VITE_STREAM_API_KEY is not set in environment variables');
    }

    console.log('Initializing Stream clients with:', { userId, userName, apiKey });

    // Initialize Video Client
    const videoClient = new StreamVideoClient({
      apiKey,
      user: {
        id: userId,
        name: userName || `User ${userId}`,
      },
      token,
    });

    // Initialize Chat Client
    const chatClient = StreamChat.getInstance(apiKey);
    
    // Connect user to chat
    await chatClient.connectUser(
      {
        id: userId,
        name: userName || `User ${userId}`,
      },
      token
    );

    console.log('Stream clients initialized successfully');
    
    return { videoClient, chatClient };
  } catch (error) {
    console.error('Error initializing Stream clients:', error);
    throw error;
  }
};

/**
 * Disconnect Stream clients
 * @param {StreamVideoClient} videoClient 
 * @param {StreamChat} chatClient 
 */
export const disconnectStreamClients = async (videoClient, chatClient) => {
  try {
    if (chatClient) {
      await chatClient.disconnectUser();
      console.log('Chat client disconnected');
    }
    
    console.log('Stream clients disconnected');
  } catch (error) {
    console.error('Error disconnecting Stream clients:', error);
  }
};