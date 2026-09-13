const prisma = require('../config/prisma');
const { streamClient, chatClient } = require('../config/stream');
const { generateId } = require('../utils/idGenerator');
const serializeWithId = require('../utils/responseSerializer');

// Create a new interview session
exports.createInterviewSession = async (req, res) => {
  try {
    const { problemId, difficulty } = req.body;
    const interviewerId = req.user.id || req.user._id;

    if (!problemId || !difficulty) {
      return res.status(400).json({
        success: false,
        message: 'Problem ID and difficulty are required'
      });
    }

    // Verify problem exists
    const problem = await prisma.problem.findUnique({
      where: { id: problemId }
    });
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Generate unique call ID
    const callId = `interview_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Create session in database
    const session = await prisma.interviewSession.create({
      data: {
        id: generateId(),
        problemId,
        difficulty,
        interviewerId,
        callId
      },
      include: {
        problem: { select: { id: true, title: true, difficulty: true } },
        interviewer: { select: { id: true, FirstName: true, EmailId: true } }
      }
    });

    // Only create Stream resources if client is initialized
    if (streamClient && chatClient) {
      try {
        await streamClient.video.call('default', callId).getOrCreate({
          data: {
            created_by_id: interviewerId.toString(),
            custom: {
              problemId: problemId.toString(),
              difficulty,
              sessionId: session.id.toString()
            },
          },
        });

        const channel = chatClient.channel('messaging', callId, {
          name: `Interview: ${problem.title}`,
          created_by_id: interviewerId.toString(),
          members: [interviewerId.toString()],
        });

        await channel.create();
        console.log('✅ Stream video call and chat created');
      } catch (streamError) {
        console.error('⚠️ Stream.io error (non-fatal):', streamError);
      }
    } else {
      console.warn('⚠️ Stream.io not configured - session created without video/chat features');
    }

    const responseSession = serializeWithId({
      ...session,
      problem: serializeWithId(session.problem),
      interviewer: serializeWithId(session.interviewer)
    });

    res.status(201).json({
      success: true,
      session: responseSession,
      message: 'Interview session created successfully'
    });
  } catch (error) {
    console.error('Error creating interview session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create interview session',
      error: error.message
    });
  }
};

// Get all active interview sessions (for candidates to join)
exports.getActiveInterviewSessions = async (req, res) => {
  try {
    const sessions = await prisma.interviewSession.findMany({
      where: {
        status: { in: ['waiting', 'active'] },
        candidateId: null
      },
      include: {
        interviewer: { select: { id: true, FirstName: true, EmailId: true } },
        problem: { select: { id: true, title: true, difficulty: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const formattedSessions = sessions.map(s => serializeWithId({
      ...s,
      interviewer: serializeWithId(s.interviewer),
      problem: serializeWithId(s.problem)
    }));

    res.status(200).json({
      success: true,
      sessions: formattedSessions
    });
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sessions',
      error: error.message
    });
  }
};

// Get user's interview sessions (both as interviewer and candidate)
exports.getMyInterviewSessions = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const sessions = await prisma.interviewSession.findMany({
      where: {
        OR: [
          { interviewerId: userId },
          { candidateId: userId }
        ]
      },
      include: {
        interviewer: { select: { id: true, FirstName: true, EmailId: true } },
        candidate: { select: { id: true, FirstName: true, EmailId: true } },
        problem: { select: { id: true, title: true, difficulty: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const formattedSessions = sessions.map(s => serializeWithId({
      ...s,
      interviewer: serializeWithId(s.interviewer),
      candidate: s.candidate ? serializeWithId(s.candidate) : null,
      problem: serializeWithId(s.problem)
    }));

    res.status(200).json({
      success: true,
      sessions: formattedSessions
    });
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sessions',
      error: error.message
    });
  }
};

// Get a specific interview session by ID
exports.getInterviewSessionById = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await prisma.interviewSession.findUnique({
      where: { id },
      include: {
        interviewer: { select: { id: true, FirstName: true, EmailId: true } },
        candidate: { select: { id: true, FirstName: true, EmailId: true } },
        problem: { select: { id: true, title: true, difficulty: true, description: true, visibleTestCases: true } }
      }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const responseSession = serializeWithId({
      ...session,
      interviewer: serializeWithId(session.interviewer),
      candidate: session.candidate ? serializeWithId(session.candidate) : null,
      problem: serializeWithId(session.problem)
    });

    res.status(200).json({
      success: true,
      session: responseSession
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch session',
      error: error.message
    });
  }
};

// Join an interview session as a candidate
exports.joinInterviewSession = async (req, res) => {
  try {
    const { id } = req.params;
    const candidateId = req.user.id || req.user._id;

    const session = await prisma.interviewSession.findUnique({
      where: { id }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.status === 'completed' || session.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot join a completed or cancelled session'
      });
    }

    if (session.interviewerId === candidateId) {
      return res.status(400).json({
        success: false,
        message: 'Interviewer cannot join as candidate'
      });
    }

    if (session.candidateId) {
      return res.status(409).json({
        success: false,
        message: 'Session already has a candidate'
      });
    }

    const updatedSession = await prisma.interviewSession.update({
      where: { id },
      data: {
        candidateId,
        status: 'active',
        startedAt: new Date()
      },
      include: {
        interviewer: { select: { id: true, FirstName: true, EmailId: true } },
        candidate: { select: { id: true, FirstName: true, EmailId: true } },
        problem: { select: { id: true, title: true, difficulty: true } }
      }
    });

    if (chatClient) {
      try {
        const channel = chatClient.channel('messaging', updatedSession.callId);
        await channel.addMembers([candidateId.toString()]);
        console.log('✅ Candidate added to Stream chat');
      } catch (streamError) {
        console.error('⚠️ Stream chat error (non-fatal):', streamError);
      }
    }

    res.status(200).json({
      success: true,
      session: serializeWithId({
        ...updatedSession,
        interviewer: serializeWithId(updatedSession.interviewer),
        candidate: serializeWithId(updatedSession.candidate),
        problem: serializeWithId(updatedSession.problem)
      }),
      message: 'Successfully joined interview session'
    });
  } catch (error) {
    console.error('Error joining session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join session',
      error: error.message
    });
  }
};

// End an interview session
exports.endInterviewSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;
    const { notes, rating, codeSnapshot, language } = req.body;

    const session = await prisma.interviewSession.findUnique({
      where: { id }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.interviewerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the interviewer can end the session'
      });
    }

    if (session.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Session is already completed'
      });
    }

    const updateData = {
      status: 'completed',
      endedAt: new Date()
    };
    if (notes !== undefined) updateData.notes = notes;
    if (rating !== undefined) updateData.rating = parseInt(rating, 10);
    if (codeSnapshot !== undefined) updateData.codeSnapshot = codeSnapshot;
    if (language !== undefined) updateData.language = language;

    const updatedSession = await prisma.interviewSession.update({
      where: { id },
      data: updateData,
      include: {
        interviewer: { select: { id: true, FirstName: true, EmailId: true } },
        candidate: { select: { id: true, FirstName: true, EmailId: true } },
        problem: { select: { id: true, title: true, difficulty: true } }
      }
    });

    if (streamClient) {
      try {
        const call = streamClient.video.call('default', updatedSession.callId);
        await call.delete({ hard: true });
        console.log('✅ Stream video call deleted');
      } catch (err) {
        console.error('⚠️ Error deleting Stream call (non-fatal):', err);
      }
    }

    if (chatClient) {
      try {
        const channel = chatClient.channel('messaging', updatedSession.callId);
        await channel.delete();
        console.log('✅ Stream chat channel deleted');
      } catch (err) {
        console.error('⚠️ Error deleting Stream channel (non-fatal):', err);
      }
    }

    res.status(200).json({
      success: true,
      session: serializeWithId({
        ...updatedSession,
        interviewer: serializeWithId(updatedSession.interviewer),
        candidate: updatedSession.candidate ? serializeWithId(updatedSession.candidate) : null,
        problem: serializeWithId(updatedSession.problem)
      }),
      message: 'Session ended successfully'
    });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end session',
      error: error.message
    });
  }
};

// Generate Stream token for authentication
exports.generateStreamToken = async (req, res) => {
  try {
    const userId = (req.user.id || req.user._id).toString();

    if (!streamClient) {
      return res.status(503).json({
        success: false,
        message: 'Stream.io is not configured. Video/chat features unavailable.'
      });
    }

    const token = streamClient.createToken(userId);

    res.status(200).json({
      success: true,
      token,
      userId: userId
    });
  } catch (error) {
    console.error('Error generating Stream token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate token',
      error: error.message
    });
  }
};