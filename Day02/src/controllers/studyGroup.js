const prisma = require('../config/prisma');
const { nanoid } = require('nanoid');
const { generateId } = require('../utils/idGenerator');
const serializeWithId = require('../utils/responseSerializer');

// Generate unique 8-character invite code
const generateInviteCode = () => {
  return nanoid(8).toUpperCase();
};

// Create Study Group
const createGroup = async (req, res) => {
  try {
    const { name, description, maxMembers, isPrivate } = req.body;
    const userId = req.user.id || req.user._id;

    // Generate unique invite code
    let inviteCode;
    let isUnique = false;

    while (!isUnique) {
      inviteCode = generateInviteCode();
      const existing = await prisma.studyGroup.findUnique({ where: { inviteCode } });
      if (!existing) isUnique = true;
    }

    const groupId = generateId();

    const group = await prisma.studyGroup.create({
      data: {
        id: groupId,
        name,
        description: description || null,
        inviteCode,
        createdBy: userId,
        maxMembers: maxMembers || 50,
        isPrivate: isPrivate !== undefined ? isPrivate : true
      }
    });

    // Add creator as admin member
    await prisma.groupMember.create({
      data: {
        id: generateId(),
        groupId: group.id,
        userId: userId,
        role: 'admin'
      }
    });

    res.status(201).json({
      success: true,
      group: serializeWithId(group),
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
    const userId = req.user.id || req.user._id;

    const group = await prisma.studyGroup.findUnique({ where: { inviteCode } });
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Invalid invite code'
      });
    }

    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId: userId
        }
      }
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        error: 'You are already a member of this group'
      });
    }

    const memberCount = await prisma.groupMember.count({ where: { groupId: group.id } });
    if (memberCount >= group.maxMembers) {
      return res.status(400).json({
        success: false,
        error: 'This group is full'
      });
    }

    await prisma.groupMember.create({
      data: {
        id: generateId(),
        groupId: group.id,
        userId: userId,
        role: 'member'
      }
    });

    res.status(200).json({
      success: true,
      group: serializeWithId(group),
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
    const userId = req.user.id || req.user._id;

    const memberships = await prisma.groupMember.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            creator: {
              select: {
                id: true,
                FirstName: true,
                EmailId: true
              }
            }
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    });

    const groups = memberships.map(m => serializeWithId({
      ...m.group,
      createdBy: serializeWithId(m.group.creator),
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
    const userId = req.user.id || req.user._id;

    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId
        }
      }
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        error: 'You are not a member of this group'
      });
    }

    const group = await prisma.studyGroup.findUnique({
      where: { id: groupId },
      include: {
        creator: {
          select: {
            id: true,
            FirstName: true,
            EmailId: true
          }
        }
      }
    });

    const members = await prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            FirstName: true,
            EmailId: true
          }
        }
      },
      orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }]
    });

    const memberCount = members.length;

    res.status(200).json({
      success: true,
      group: serializeWithId({
        ...group,
        createdBy: serializeWithId(group.creator),
        memberCount,
        userRole: member.role
      }),
      members: members.map(m => serializeWithId({
        ...m,
        userId: serializeWithId(m.user)
      }))
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
    const userId = req.user.id || req.user._id;

    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId
        }
      }
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'You are not a member of this group'
      });
    }

    if (member.role === 'admin') {
      const memberCount = await prisma.groupMember.count({ where: { groupId } });

      if (memberCount > 1) {
        return res.status(400).json({
          success: false,
          error: 'Transfer admin role before leaving'
        });
      } else {
        // Last member (admin) - delete entire group; PostgreSQL CASCADE deletes members, sessions, messages, progress
        await prisma.studyGroup.delete({
          where: { id: groupId }
        });
      }
    } else {
      await prisma.groupMember.delete({
        where: { id: member.id }
      });
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

// Start Session
const startSession = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { problemId } = req.body;
    const userId = req.user.id || req.user._id;

    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId
        }
      }
    });

    if (!member || (member.role !== 'admin' && member.role !== 'moderator')) {
      return res.status(403).json({
        success: false,
        error: 'Only admins and moderators can start sessions'
      });
    }

    // End active sessions
    await prisma.groupSession.updateMany({
      where: { groupId, status: 'active' },
      data: { status: 'completed', endedAt: new Date() }
    });

    const sessionId = generateId();
    const session = await prisma.groupSession.create({
      data: {
        id: sessionId,
        groupId,
        problemId,
        createdBy: userId,
        status: 'active'
      },
      include: {
        problem: { select: { id: true, title: true, difficulty: true, tags: true } },
        creator: { select: { id: true, FirstName: true, EmailId: true } }
      }
    });

    res.status(201).json({
      success: true,
      session: serializeWithId({
        ...session,
        problemId: serializeWithId(session.problem),
        createdBy: serializeWithId(session.creator)
      })
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
    const userId = req.user.id || req.user._id;

    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId
        }
      }
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        error: 'You are not a member of this group'
      });
    }

    const session = await prisma.groupSession.findFirst({
      where: { groupId, status: 'active' },
      include: {
        problem: true,
        creator: { select: { id: true, FirstName: true, EmailId: true } }
      }
    });

    res.status(200).json({
      success: true,
      session: session ? serializeWithId({
        ...session,
        problemId: serializeWithId(session.problem),
        createdBy: serializeWithId(session.creator)
      }) : null
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
    const userId = req.user.id || req.user._id;

    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId
        }
      }
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        error: 'You are not a member of this group'
      });
    }

    const where = { groupId };
    if (sessionId) where.sessionId = sessionId;

    const messages = await prisma.groupMessage.findMany({
      where,
      include: {
        user: { select: { id: true, FirstName: true, EmailId: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit, 10)
    });

    const serialized = messages.map(m => serializeWithId({
      ...m,
      userId: serializeWithId(m.user)
    })).reverse();

    res.status(200).json({
      success: true,
      messages: serialized
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
    const userId = req.user.id || req.user._id;

    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId
        }
      }
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        error: 'You are not a member of this group'
      });
    }

    const progressRecords = await prisma.groupProgress.findMany({
      where: { groupId },
      include: {
        problem: { select: { id: true, title: true, difficulty: true, tags: true } },
        solvers: {
          include: {
            user: { select: { id: true, FirstName: true, EmailId: true } }
          }
        }
      },
      orderBy: { completedAt: 'desc' }
    });

    const progress = progressRecords.map(p => serializeWithId({
      ...p,
      problemId: serializeWithId(p.problem),
      solvedBy: p.solvers.map(s => serializeWithId(s.user))
    }));

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