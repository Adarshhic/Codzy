const GroupMessage = require('../models/GroupMessage');
const GroupMember = require('../models/GroupMember');
const GroupProgress = require('../models/GroupProgress');

// In-memory storage for active connections
const activeRooms = new Map(); // roomId -> Set of socket objects
const userSocketMap = new Map(); // userId -> socketId
const interviewSessions = new Map(); // sessionId -> Set of socketIds
const interviewUserSockets = new Map(); // socketId -> { userId, sessionId }

const initializeSocket = (io) => {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      // Extract user info from handshake (assuming JWT is passed)
      const userId = socket.handshake.auth.userId;
      const username = socket.handshake.auth.username;
      
      if (!userId || !username) {
        return next(new Error('Authentication failed'));
      }
      
      socket.userId = userId;
      socket.username = username;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.username} (${socket.id})`);

    // ==================== INTERVIEW SESSION HANDLERS ====================
    
    /**
     * Join an interview session room
     */
    socket.on('join-interview', (sessionId) => {
      if (!sessionId) {
        console.error('No sessionId provided for join-interview');
        return;
      }

      console.log(`Socket ${socket.id} joining interview session: ${sessionId}`);

      // Leave any previous interview session
      const previousSession = interviewUserSockets.get(socket.id)?.sessionId;
      if (previousSession && previousSession !== sessionId) {
        handleLeaveInterview(socket, previousSession);
      }

      // Join the interview room
      socket.join(`interview-${sessionId}`);

      // Track the session
      if (!interviewSessions.has(sessionId)) {
        interviewSessions.set(sessionId, new Set());
      }
      interviewSessions.get(sessionId).add(socket.id);

      // Store user info
      interviewUserSockets.set(socket.id, {
        socketId: socket.id,
        sessionId,
        joinedAt: new Date(),
      });

      // Notify all participants about active users
      const activeUsers = interviewSessions.get(sessionId).size;
      io.to(`interview-${sessionId}`).emit('active-users', { count: activeUsers });

      socket.emit('joined-interview', { sessionId, activeUsers });
      
      console.log(`Session ${sessionId} now has ${activeUsers} active user(s)`);
    });

    /**
     * Handle code changes in interview
     */
    socket.on('code-change', ({ sessionId, code, language }) => {
      if (!sessionId) {
        console.error('No sessionId provided for code-change');
        return;
      }

      const userInfo = interviewUserSockets.get(socket.id);
      if (!userInfo || userInfo.sessionId !== sessionId) {
        console.error('User not in session or session mismatch');
        return;
      }

      console.log(`Code change in session ${sessionId} from ${socket.id}`);

      // Broadcast to all other participants in the session (except sender)
      socket.to(`interview-${sessionId}`).emit('code-update', {
        code,
        language,
        userId: socket.id,
        timestamp: Date.now(),
      });
    });

    /**
     * Handle language changes in interview
     */
    socket.on('language-change', ({ sessionId, language }) => {
      if (!sessionId) {
        console.error('No sessionId provided for language-change');
        return;
      }

      const userInfo = interviewUserSockets.get(socket.id);
      if (!userInfo || userInfo.sessionId !== sessionId) {
        console.error('User not in session or session mismatch');
        return;
      }

      console.log(`Language change in session ${sessionId}: ${language}`);

      // Broadcast to all other participants
      socket.to(`interview-${sessionId}`).emit('language-change', {
        language,
        userId: socket.id,
        timestamp: Date.now(),
      });
    });

    /**
     * Leave interview session
     */
    socket.on('leave-interview', (sessionId) => {
      handleLeaveInterview(socket, sessionId);
    });

    // ==================== STUDY GROUP HANDLERS ====================

    socket.on('join-room', async ({ roomId, groupId, sessionId }) => {
      try {
        // Verify user is a member of the group
        const member = await GroupMember.findOne({
          groupId: groupId,
          userId: socket.userId
        });

        if (!member) {
          socket.emit('error', { message: 'You are not a member of this group' });
          return;
        }

        // Join the room
        socket.join(roomId);
        socket.currentRoom = roomId;
        socket.currentGroupId = groupId;
        socket.currentSessionId = sessionId;

        // Track active users
        if (!activeRooms.has(roomId)) {
          activeRooms.set(roomId, new Set());
        }
        activeRooms.get(roomId).add(socket);
        userSocketMap.set(socket.userId, socket.id);

        // Update last active time
        await GroupMember.findOneAndUpdate(
          { groupId: groupId, userId: socket.userId },
          { lastActive: new Date() }
        );

        // Get current room participants
        const roomSockets = Array.from(activeRooms.get(roomId));
        const participants = roomSockets.map(s => ({
          userId: s.userId,
          username: s.username,
          socketId: s.id
        }));

        // Notify others that user joined
        socket.to(roomId).emit('user-joined', {
          userId: socket.userId,
          username: socket.username,
          timestamp: new Date()
        });

        // Send current participants to the new user
        socket.emit('room-users', {
          participants,
          count: participants.length
        });

        // Send system message
        const systemMessage = await GroupMessage.create({
          groupId: groupId,
          sessionId: sessionId,
          userId: socket.userId,
          message: `${socket.username} joined the session`,
          messageType: 'system'
        });

        io.to(roomId).emit('receive-message', {
          _id: systemMessage._id,
          userId: socket.userId,
          username: socket.username,
          message: systemMessage.message,
          messageType: 'system',
          timestamp: systemMessage.createdAt
        });

        console.log(`🔥 ${socket.username} joined room: ${roomId}`);
      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    socket.on('send-message', async ({ roomId, groupId, sessionId, message, messageType = 'text' }) => {
      try {
        const newMessage = await GroupMessage.create({
          groupId: groupId,
          sessionId: sessionId,
          userId: socket.userId,
          message: message,
          messageType: messageType
        });

        const populatedMessage = await GroupMessage.findById(newMessage._id)
          .populate('userId', 'FirstName EmailId');

        io.to(roomId).emit('receive-message', {
          _id: populatedMessage._id,
          userId: populatedMessage.userId._id,
          username: populatedMessage.userId.FirstName,
          message: populatedMessage.message,
          messageType: populatedMessage.messageType,
          timestamp: populatedMessage.createdAt
        });

        console.log(`💬 Message in ${roomId} from ${socket.username}`);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('code-change', ({ roomId, code, language, cursorPosition }) => {
      socket.to(roomId).emit('code-updated', {
        userId: socket.userId,
        username: socket.username,
        code: code,
        language: language,
        cursorPosition: cursorPosition,
        timestamp: new Date()
      });
    });

    socket.on('cursor-position', ({ roomId, position }) => {
      socket.to(roomId).emit('cursor-update', {
        userId: socket.userId,
        username: socket.username,
        position: position
      });
    });

    socket.on('problem-change', async ({ roomId, groupId, problemId, problemTitle }) => {
      try {
        const member = await GroupMember.findOne({
          groupId: groupId,
          userId: socket.userId
        });

        if (!member || (member.role !== 'admin' && member.role !== 'moderator')) {
          socket.emit('error', { message: 'Only admins and moderators can change problems' });
          return;
        }

        io.to(roomId).emit('problem-changed', {
          problemId: problemId,
          problemTitle: problemTitle,
          changedBy: socket.username,
          timestamp: new Date()
        });

        const systemMessage = await GroupMessage.create({
          groupId: groupId,
          sessionId: socket.currentSessionId,
          userId: socket.userId,
          message: `${socket.username} changed the problem to: ${problemTitle}`,
          messageType: 'system'
        });

        io.to(roomId).emit('receive-message', {
          _id: systemMessage._id,
          userId: socket.userId,
          username: socket.username,
          message: systemMessage.message,
          messageType: 'system',
          timestamp: systemMessage.createdAt
        });

        console.log(`📄 Problem changed in ${roomId} to: ${problemTitle}`);
      } catch (error) {
        console.error('Problem change error:', error);
        socket.emit('error', { message: 'Failed to change problem' });
      }
    });

    socket.on('problem-solved', async ({ roomId, groupId, problemId, problemTitle }) => {
      try {
        let progress = await GroupProgress.findOne({ groupId, problemId });

        if (!progress) {
          progress = await GroupProgress.create({
            groupId: groupId,
            problemId: problemId,
            solvedBy: [socket.userId],
            completedAt: new Date()
          });
        } else if (!progress.solvedBy.includes(socket.userId)) {
          progress.solvedBy.push(socket.userId);
          await progress.save();
        }

        io.to(roomId).emit('user-solved-problem', {
          userId: socket.userId,
          username: socket.username,
          problemTitle: problemTitle,
          timestamp: new Date()
        });

        const systemMessage = await GroupMessage.create({
          groupId: groupId,
          sessionId: socket.currentSessionId,
          userId: socket.userId,
          message: `🎉 ${socket.username} solved the problem!`,
          messageType: 'system'
        });

        io.to(roomId).emit('receive-message', {
          _id: systemMessage._id,
          userId: socket.userId,
          username: socket.username,
          message: systemMessage.message,
          messageType: 'system',
          timestamp: systemMessage.createdAt
        });

        console.log(`🎉 ${socket.username} solved ${problemTitle} in room ${roomId}`);
      } catch (error) {
        console.error('Problem solved error:', error);
      }
    });

    socket.on('typing-start', ({ roomId }) => {
      socket.to(roomId).emit('user-typing', {
        userId: socket.userId,
        username: socket.username
      });
    });

    socket.on('typing-stop', ({ roomId }) => {
      socket.to(roomId).emit('user-stopped-typing', {
        userId: socket.userId
      });
    });

    socket.on('leave-room', async ({ roomId, groupId }) => {
      try {
        socket.leave(roomId);

        if (activeRooms.has(roomId)) {
          activeRooms.get(roomId).delete(socket);
          if (activeRooms.get(roomId).size === 0) {
            activeRooms.delete(roomId);
          }
        }
        userSocketMap.delete(socket.userId);

        socket.to(roomId).emit('user-left', {
          userId: socket.userId,
          username: socket.username,
          timestamp: new Date()
        });

        if (groupId && socket.currentSessionId) {
          const systemMessage = await GroupMessage.create({
            groupId: groupId,
            sessionId: socket.currentSessionId,
            userId: socket.userId,
            message: `${socket.username} left the session`,
            messageType: 'system'
          });

          io.to(roomId).emit('receive-message', {
            _id: systemMessage._id,
            userId: socket.userId,
            username: socket.username,
            message: systemMessage.message,
            messageType: 'system',
            timestamp: systemMessage.createdAt
          });
        }

        console.log(`🔙 ${socket.username} left room: ${roomId}`);
      } catch (error) {
        console.error('Leave room error:', error);
      }
    });

    // ==================== DISCONNECT ====================
    socket.on('disconnect', async () => {
      try {
        // Clean up interview session if user was in one
        const interviewInfo = interviewUserSockets.get(socket.id);
        if (interviewInfo?.sessionId) {
          handleLeaveInterview(socket, interviewInfo.sessionId);
        }

        // Clean up study group room
        const roomId = socket.currentRoom;
        const groupId = socket.currentGroupId;

        if (roomId) {
          if (activeRooms.has(roomId)) {
            activeRooms.get(roomId).delete(socket);
            if (activeRooms.get(roomId).size === 0) {
              activeRooms.delete(roomId);
            }
          }
          userSocketMap.delete(socket.userId);

          socket.to(roomId).emit('user-left', {
            userId: socket.userId,
            username: socket.username,
            timestamp: new Date()
          });

          if (groupId && socket.currentSessionId) {
            const systemMessage = await GroupMessage.create({
              groupId: groupId,
              sessionId: socket.currentSessionId,
              userId: socket.userId,
              message: `${socket.username} disconnected`,
              messageType: 'system'
            });

            io.to(roomId).emit('receive-message', {
              _id: systemMessage._id,
              userId: socket.userId,
              username: socket.username,
              message: systemMessage.message,
              messageType: 'system',
              timestamp: systemMessage.createdAt
            });
          }
        }

        console.log(`❌ User disconnected: ${socket.username} (${socket.id})`);
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    });
  });

  /**
   * Helper function to handle leaving an interview
   */
  function handleLeaveInterview(socket, sessionId) {
    if (!sessionId) return;

    console.log(`Socket ${socket.id} leaving interview session: ${sessionId}`);

    // Leave the room
    socket.leave(`interview-${sessionId}`);

    // Remove from tracking
    const session = interviewSessions.get(sessionId);
    if (session) {
      session.delete(socket.id);
      
      // If session is empty, clean it up
      if (session.size === 0) {
        interviewSessions.delete(sessionId);
        console.log(`Session ${sessionId} is now empty and cleaned up`);
      } else {
        // Update active users count for remaining participants
        io.to(`interview-${sessionId}`).emit('active-users', { count: session.size });
      }
    }

    interviewUserSockets.delete(socket.id);
  }

  console.log('🚀 Socket.io server initialized with interview support');
};

module.exports = initializeSocket;