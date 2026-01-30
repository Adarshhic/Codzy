const StudyGroup = require('../models/StudyGroup');
const GroupMember = require('../models/GroupMember');
const GroupSession = require('../models/GroupSession');
const GroupMessage = require('../models/GroupMessage');
const GroupProgress = require('../models/GroupProgress');
const { nanoid } = require('nanoid');

// Generate unique 8-character invite code
const generateInviteCode = () => {
  return nanoid(8).toUpperCase();
};

// Create Study Group
const createGroup = async (req, res) => {
  try {
    const { name, description, maxMembers, isPrivate } = req.body;
    const userId = req.user._id;

    // Generate unique invite code
    let inviteCode;
    let isUnique = false;
    
    while (!isUnique) {
      inviteCode = generateInviteCode();
      const existing = await StudyGroup.findOne({ inviteCode });
      if (!existing) isUnique = true;
    }

    // Create group
    const group = await StudyGroup.create({
      name,
      description,
      inviteCode,
      createdBy: userId,
      maxMembers: maxMembers || 50,
      isPrivate: isPrivate !== undefined ? isPrivate : true
    });

    // Add creator as admin member
    await GroupMember.create({
      groupId: group._id,
      userId: userId,
      role: 'admin'
    });

    res.status(201).json({
      success: true,
      group,
      message: 'Study group created successfully'
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create study group'
    });
  }
};

// Join Group with Invite Code
const joinGroup = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const userId = req.user._id;

    // Find group
    const group = await StudyGroup.findOne({ inviteCode });
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Invalid invite code'
      });
    }

    // Check if already a member
    const existingMember = await GroupMember.findOne({
      groupId: group._id,
      userId: userId
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        error: 'You are already a member of this group'
      });
    }

    // Check if group is full
    const memberCount = await GroupMember.countDocuments({ groupId: group._id });
    if (memberCount >= group.maxMembers) {
      return res.status(400).json({
        success: false,
        error: 'This group is full'
      });
    }

    // Add member
    await GroupMember.create({
      groupId: group._id,
      userId: userId,
      role: 'member'
    });

    res.status(200).json({
      success: true,
      group,
      message: 'Successfully joined the group'
    });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to join group'
    });
  }
};

// Get User's Groups
const getUserGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const memberships = await GroupMember.find({ userId })
      .populate({
        path: 'groupId',
        populate: {
          path: 'createdBy',
          select: 'FirstName EmailId'
        }
      })
      .sort({ joinedAt: -1 });

    const groups = memberships.map(m => ({
      ...m.groupId.toObject(),
      userRole: m.role,
      joinedAt: m.joinedAt
    }));

    res.status(200).json({
      success: true,
      groups
    });
  } catch (error) {
    console.error('Get user groups error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch groups'
    });
  }
};

// Get Group Details
const getGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    // Check membership
    const member = await GroupMember.findOne({ groupId, userId });
    if (!member) {
      return res.status(403).json({
        success: false,
        error: 'You are not a member of this group'
      });
    }

    const group = await StudyGroup.findById(groupId)
      .populate('createdBy', 'FirstName EmailId');

    const members = await GroupMember.find({ groupId })
      .populate('userId', 'FirstName EmailId')
      .sort({ role: 1, joinedAt: 1 });

    const memberCount = members.length;

    res.status(200).json({
      success: true,
      group: {
        ...group.toObject(),
        memberCount,
        userRole: member.role
      },
      members
    });
  } catch (error) {
    console.error('Get group details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch group details'
    });
  }
};

// Leave Group
const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const member = await GroupMember.findOne({ groupId, userId });
    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'You are not a member of this group'
      });
    }

    // Check if user is admin
    if (member.role === 'admin') {
      const memberCount = await GroupMember.countDocuments({ groupId });
      
      if (memberCount > 1) {
        return res.status(400).json({
          success: false,
          error: 'Transfer admin role before leaving'
        });
      } else {
        // Last member (admin) - delete entire group
        await StudyGroup.findByIdAndDelete(groupId);
        await GroupMember.deleteMany({ groupId });
        await GroupSession.deleteMany({ groupId });
        await GroupMessage.deleteMany({ groupId });
        await GroupProgress.deleteMany({ groupId });
      }
    } else {
      await GroupMember.findByIdAndDelete(member._id);
    }

    res.status(200).json({
      success: true,
      message: 'Successfully left the group'
    });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to leave group'
    });
  }
};

// Start Session (Admin/Moderator only)
const startSession = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { problemId } = req.body;
    const userId = req.user._id;

    // Check if user is admin/moderator
    const member = await GroupMember.findOne({ groupId, userId });
    if (!member || (member.role !== 'admin' && member.role !== 'moderator')) {
      return res.status(403).json({
        success: false,
        error: 'Only admins and moderators can start sessions'
      });
    }

    // End any active sessions
    await GroupSession.updateMany(
      { groupId, status: 'active' },
      { status: 'completed', endedAt: new Date() }
    );

    // Create new session
    const session = await GroupSession.create({
      groupId,
      problemId,
      createdBy: userId,
      status: 'active'
    });

    const populatedSession = await GroupSession.findById(session._id)
      .populate('problemId', 'title difficulty tags')
      .populate('createdBy', 'FirstName EmailId');

    res.status(201).json({
      success: true,
      session: populatedSession
    });
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start session'
    });
  }
};

// Get Active Session
const getActiveSession = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    // Check membership
    const member = await GroupMember.findOne({ groupId, userId });
    if (!member) {
      return res.status(403).json({
        success: false,
        error: 'You are not a member of this group'
      });
    }

    const session = await GroupSession.findOne({ groupId, status: 'active' })
      .populate('problemId')
      .populate('createdBy', 'FirstName EmailId');

    res.status(200).json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Get active session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active session'
    });
  }
};

// Get Group Messages
const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { sessionId, limit = 50 } = req.query;
    const userId = req.user._id;

    // Check membership
    const member = await GroupMember.findOne({ groupId, userId });
    if (!member) {
      return res.status(403).json({
        success: false,
        error: 'You are not a member of this group'
      });
    }

    const query = { groupId };
    if (sessionId) query.sessionId = sessionId;

    const messages = await GroupMessage.find(query)
      .populate('userId', 'FirstName EmailId')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      messages: messages.reverse()
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    });
  }
};

// Get Group Progress
const getGroupProgress = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    // Check membership
    const member = await GroupMember.findOne({ groupId, userId });
    if (!member) {
      return res.status(403).json({
        success: false,
        error: 'You are not a member of this group'
      });
    }

    const progress = await GroupProgress.find({ groupId })
      .populate('problemId', 'title difficulty tags')
      .populate('solvedBy', 'FirstName EmailId')
      .sort({ completedAt: -1 });

    res.status(200).json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch progress'
    });
  }
};

module.exports = {
  createGroup,
  joinGroup,
  getUserGroups,
  getGroupDetails,
  leaveGroup,
  startSession,
  getActiveSession,
  getGroupMessages,
  getGroupProgress
};