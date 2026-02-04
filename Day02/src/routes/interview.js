const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const { verifyToken } = require('../middleware/userMiddleware');

// Create a new interview session
router.post('/create', verifyToken, interviewController.createInterviewSession);

// Get all active interview sessions
router.get('/active', verifyToken, interviewController.getActiveInterviewSessions);

// Get user's interview sessions
router.get('/my-sessions', verifyToken, interviewController.getMyInterviewSessions);

// Get specific interview session
router.get('/:id', verifyToken, interviewController.getInterviewSessionById);

// Join an interview session
router.post('/:id/join', verifyToken, interviewController.joinInterviewSession);

// End an interview session
router.post('/:id/end', verifyToken, interviewController.endInterviewSession);

// Generate Stream token
router.get('/auth/stream-token', verifyToken, interviewController.generateStreamToken);

module.exports = router;