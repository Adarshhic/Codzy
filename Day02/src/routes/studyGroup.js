const express = require('express');
const studyGroupRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const {
  createGroup,
  joinGroup,
  getUserGroups,
  getGroupDetails,
  leaveGroup,
  startSession,
  getActiveSession,
  getGroupMessages,
  getGroupProgress
} = require('../controllers/studyGroup');

// All routes require authentication
studyGroupRouter.use(userMiddleware);

// Group Management
studyGroupRouter.post('/create', createGroup);
studyGroupRouter.post('/join', joinGroup);
studyGroupRouter.get('/my-groups', getUserGroups);
studyGroupRouter.get('/:groupId', getGroupDetails);
studyGroupRouter.delete('/:groupId/leave', leaveGroup);

// Session Management
studyGroupRouter.post('/:groupId/session/start', startSession);
studyGroupRouter.get('/:groupId/session/active', getActiveSession);

// Messages & Progress
studyGroupRouter.get('/:groupId/messages', getGroupMessages);
studyGroupRouter.get('/:groupId/progress', getGroupProgress);

module.exports = studyGroupRouter;