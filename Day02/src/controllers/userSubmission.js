const prisma = require('../config/prisma');
const { runCodeWithPiston } = require('../utils/problemUtility');
const { generateId } = require('../utils/idGenerator');
const serializeWithId = require('../utils/responseSerializer');

const submitCode = async (req, res) => {
  try {
    let { problemId, code, language } = req.body;
    const userId = req.user.id || req.user._id;

    if (!problemId || !code || !language) {
      return res.status(400).json({ message: 'Some fields are missing' });
    }

    // 1️⃣ Validate problem
    const problem = await prisma.problem.findUnique({
      where: { id: problemId }
    });
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    if (language === 'cpp') language = 'c++';

    const visibleTestCases = problem.visibleTestCases || [];
    const hiddenTestCases = problem.hiddenTestCases || [];
    const allTestCases = [...visibleTestCases, ...hiddenTestCases];

    // 2️⃣ Create submission (pending)
    const submissionId = generateId();
    let submission = await prisma.submission.create({
      data: {
        id: submissionId,
        userId,
        problemId,
        code,
        language,
        status: 'pending',
        testCasesTotal: allTestCases.length
      }
    });

    let passedCount = 0;

    // 3️⃣ Execute test cases
    for (const testCase of allTestCases) {
      const inputStr = Array.isArray(testCase.input) ? testCase.input.join('\n') : (testCase.input || '');
      const expectedOutputStr = Array.isArray(testCase.output) ? testCase.output.join('\n').trim() : (testCase.output || '').trim();

      const result = await runCodeWithPiston({
        language,
        code,
        input: inputStr
      });

      if (result.stderr) {
        submission = await prisma.submission.update({
          where: { id: submissionId },
          data: {
            status: 'error',
            errorMessage: result.stderr,
            testCasesPassed: passedCount
          }
        });

        return res.status(200).json({
          message: 'Runtime Error',
          submission: serializeWithId(submission)
        });
      }

      const actualOutput = (result.stdout || '').trim();

      if (actualOutput === expectedOutputStr) {
        passedCount++;
      } else {
        submission = await prisma.submission.update({
          where: { id: submissionId },
          data: {
            status: 'wrong',
            testCasesPassed: passedCount
          }
        });

        return res.status(200).json({
          message: 'Wrong Answer',
          submission: serializeWithId(submission)
        });
      }
    }

    // 4️⃣ Accepted
    submission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: 'accepted',
        testCasesPassed: passedCount,
        runtime: 120,
        memory: 2048,
        errorMessage: ''
      }
    });

    // Notify study groups
    const io = req.app.get('io');
    if (io) {
      await notifyStudyGroups(userId, problemId, io);
    }

    // Update solved problems relation
    await prisma.userSolvedProblem.upsert({
      where: {
        userId_problemId: {
          userId,
          problemId
        }
      },
      create: {
        userId,
        problemId
      },
      update: {}
    });

    return res.status(200).json({
      message: 'Accepted',
      submission: serializeWithId(submission)
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Internal Server Error'
    });
  }
};

const runCode = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const problemId = req.params.id;

    let { code, language } = req.body;
    if (!userId || !code || !problemId || !language)
      return res.status(400).send("Some field missing");

    const problem = await prisma.problem.findUnique({
      where: { id: problemId }
    });
    if (!problem) return res.status(404).send("Problem not found");

    if (language === 'c++') language = 'c++';

    const testCases = problem.visibleTestCases || [];

    let testCasesPassed = 0;
    let totalRuntime = 0;
    let maxMemory = 0;
    let status = true;
    let errorMessage = null;

    const testResult = [];

    for (const testCase of testCases) {
      const inputStr = Array.isArray(testCase.input) ? testCase.input.join('\n') : (testCase.input || '');
      const expectedOutputStr = Array.isArray(testCase.output) ? testCase.output.join('\n').trim() : (testCase.output || '').trim();

      const result = await runCodeWithPiston({
        language,
        code,
        input: inputStr
      });

      const actualOutput = (result.stdout || '').trim();
      const passed = actualOutput === expectedOutputStr;

      if (!passed) status = false;
      if (result.stderr) {
        status = false;
        errorMessage = result.stderr;
      }

      testResult.push({
        input: testCase.input,
        expected_output: testCase.output,
        output: result.stdout,
        stderr: result.stderr,
        passed
      });

      if (passed) testCasesPassed++;
      totalRuntime += parseFloat(result.time || 0);
      maxMemory = Math.max(maxMemory, result.memory || 0);
    }

    res.status(201).json({
      success: status,
      testCases: testResult,
      testCasesPassed,
      runtime: totalRuntime,
      memory: maxMemory,
      errorMessage
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error: " + err);
  }
};

const notifyStudyGroups = async (userId, problemId, io) => {
  try {
    const userGroups = await prisma.groupMember.findMany({
      where: { userId },
      select: { groupId: true }
    });
    const groupIds = userGroups.map(g => g.groupId);

    const activeSessions = await prisma.groupSession.findMany({
      where: {
        groupId: { in: groupIds },
        problemId: problemId,
        status: 'active'
      },
      include: {
        problem: { select: { title: true } }
      }
    });

    activeSessions.forEach(session => {
      const roomId = `session-${session.id}`;
      io.to(roomId).emit('member-solved-problem', {
        userId: userId,
        problemId: problemId,
        problemTitle: session.problem.title,
        sessionId: session.id,
        timestamp: new Date()
      });
    });
  } catch (error) {
    console.error('Notify study groups error:', error);
  }
};

module.exports = { submitCode, runCode, notifyStudyGroups };