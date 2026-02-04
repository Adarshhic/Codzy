const InterviewSession = require('../models/InterviewSession');
const Problem = require('../models/problem');
const { streamClient, chatClient } = require('../config/stream');

// Create a new interview session
exports.createInterviewSession = async (req, res) => {
  try {
    const { problemId, difficulty } = req.body;
    const interviewerId = req.user.userId;

    if (!problemId || !difficulty) {
      return res.status(400).json({ 
        success: false, 
        message: 'Problem ID and difficulty are required' 
      });
    }

    // Verify problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Problem not found' 
      });
    }

    // Generate unique call ID
    const callId = `interview_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Create session in database
    const session = await InterviewSession.create({
      problem: problemId,
      difficulty,
      interviewer: interviewerId,
      callId
    });

    // Create Stream video call
    await streamClient.video.call('default', callId).getOrCreate({
      data: {
        created_by_id: req.user.userId.toString(),
        custom: { 
          problemId: problemId.toString(), 
          difficulty, 
          sessionId: session._id.toString() 
        },
      },
    });

    // Create Stream chat channel
    const channel = chatClient.channel('messaging', callId, {
      name: `Interview: ${problem.title}`,
      created_by_id: req.user.userId.toString(),
      members: [req.user.userId.toString()],
    });

    await channel.create();

    // Populate session data
    await session.populate('problem interviewer', 'title difficulty name email FirstName');

    res.status(201).json({ 
      success: true, 
      session,
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
    const sessions = await InterviewSession.find({ 
      status: { $in: ['waiting', 'active'] },
      candidate: null  // Only sessions without a candidate
    })
      .populate('interviewer', 'name email FirstName')
      .populate('problem', 'title difficulty')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ 
      success: true, 
      sessions 
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
    const userId = req.user.userId;

    const sessions = await InterviewSession.find({
      $or: [
        { interviewer: userId },
        { candidate: userId }
      ]
    })
      .populate('interviewer candidate', 'name email FirstName')
      .populate('problem', 'title difficulty')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ 
      success: true, 
      sessions 
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

    const session = await InterviewSession.findById(id)
      .populate('interviewer candidate', 'name email FirstName')
      .populate('problem', 'title difficulty description testCases');

    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      session 
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
    const candidateId = req.user.userId;

    const session = await InterviewSession.findById(id);

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

    if (session.interviewer.toString() === candidateId.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Interviewer cannot join as candidate' 
      });
    }

    if (session.candidate) {
      return res.status(409).json({ 
        success: false, 
        message: 'Session already has a candidate' 
      });
    }

    // Update session
    session.candidate = candidateId;
    session.status = 'active';
    session.startedAt = new Date();
    await session.save();

    // Add candidate to Stream chat channel
    const channel = chatClient.channel('messaging', session.callId);
    await channel.addMembers([candidateId.toString()]);

    await session.populate('interviewer candidate', 'name email FirstName');
    await session.populate('problem', 'title difficulty');

    res.status(200).json({ 
      success: true, 
      session,
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
    const userId = req.user.userId;
    const { notes, rating, codeSnapshot, language } = req.body;

    const session = await InterviewSession.findById(id);

    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
    }

    // Only interviewer can end the session
    if (session.interviewer.toString() !== userId.toString()) {
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

    // Update session
    session.status = 'completed';
    session.endedAt = new Date();
    if (notes) session.notes = notes;
    if (rating) session.rating = rating;
    if (codeSnapshot) session.codeSnapshot = codeSnapshot;
    if (language) session.language = language;
    await session.save();

    // Delete Stream video call
    try {
      const call = streamClient.video.call('default', session.callId);
      await call.delete({ hard: true });
    } catch (err) {
      console.error('Error deleting Stream call:', err);
    }

    // Delete Stream chat channel
    try {
      const channel = chatClient.channel('messaging', session.callId);
      await channel.delete();
    } catch (err) {
      console.error('Error deleting Stream channel:', err);
    }

    res.status(200).json({ 
      success: true, 
      session,
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
    const userId = req.user.userId.toString();
    
    // Generate token for Stream SDK
    const token = streamClient.createToken(userId);
    
    // FIXED: Return userId along with token
    res.status(200).json({ 
      success: true, 
      token,
      userId: userId  // ✅ Frontend needs this
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