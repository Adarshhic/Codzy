const Submission = require('../models/Submission');
const Problem = require('../models/problem');
const { runCodeWithPiston } = require('../utils/problemUtility');

const submitCode = async (req, res) => {
  try {
    let { problemId, code, language } = req.body;
    const userId = req.user._id;
    if (!problemId || !code || !language) {
      return res.status(400).json({ message: 'Some fields are missing' });
    }
    // 1️⃣ Validate problem
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
   if (language === 'cpp') language = 'c++';


    const visibleTestCases = problem.visibleTestCases || [];
    const hiddenTestCases = problem.hiddenTestCases || [];
    const allTestCases = [...visibleTestCases, ...hiddenTestCases];

    // 2️⃣ Create submission (pending)
    const submission = await Submission.create({
      userId,
      problemId,
      code,
      language,
      status: 'pending',
      testCasesTotal: allTestCases.length
    });

    let passedCount = 0;

    // 3️⃣ Execute test cases
    for (const testCase of allTestCases) {
      const result = await runCodeWithPiston({
        language,
        code,
        input: testCase.input.join('\n')
      });

      if (result.stderr) {
        submission.status = 'error';
        submission.errorMessage = result.stderr;
        submission.testCasesPassed = passedCount;
        await submission.save();

        return res.status(200).json({
          message: 'Runtime Error',
          submission
        });
      }

      const expectedOutput = testCase.output.join('\n').trim();
      const actualOutput = result.stdout.trim();

      if (actualOutput === expectedOutput) {
        passedCount++;
      } else {
        submission.status = 'wrong';
        submission.testCasesPassed = passedCount;
        await submission.save();

        return res.status(200).json({
          message: 'Wrong Answer',
          submission
        });
      }
    }

    // 4️⃣ Accepted
    submission.status = 'accepted';
    submission.testCasesPassed = passedCount;
    submission.runtime = 120;
    submission.memory = 2048;
    submission.errorMessage = '';

    await submission.save();

    // updated
    const io = req.app.get('io');
      if (io) {
        await notifyStudyGroups(req.user._id, problemId, io);
      }

    // ✅ TEACHER'S WAY: Update solved problems
if (!req.user.problemsSolved.includes(problemId)) {
  req.user.problemsSolved.push(problemId);
  await req.user.save();
}


    return res.status(200).json({
      message: 'Accepted',
      submission
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
    const userId = req.user._id; // ✅ user from middleware
    const problemId = req.params.id;

    let { code, language } = req.body;
    if (!userId || !code || !problemId || !language)
      return res.status(400).send("Some field missing");

    // 1️⃣ Fetch the problem
    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).send("Problem not found");

    if (language === 'c++') language = 'c++';

    // 2️⃣ Take only visible test cases
    const testCases = problem.visibleTestCases || [];

    let testCasesPassed = 0;
    let totalRuntime = 0;
    let maxMemory = 0;
    let status = true;
    let errorMessage = null;

    const testResult = [];

    // 3️⃣ Run each test case
    for (const testCase of testCases) {
      const inputStr = Array.isArray(testCase.input) ? testCase.input.join('\n') : testCase.input;
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

    // 4️⃣ Return structured JSON
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
    const GroupMember = require('../models/GroupMember');
    const GroupSession = require('../models/GroupSession');
    const Problem = require('../models/problem');
    
    // Find active sessions where user is a member and problem matches
    const userGroups = await GroupMember.find({ userId }).select('groupId');
    const groupIds = userGroups.map(g => g.groupId);
    
    const activeSessions = await GroupSession.find({
      groupId: { $in: groupIds },
      problemId: problemId,
      status: 'active'
    }).populate('problemId', 'title');
    
    // Emit socket event to each active session
    activeSessions.forEach(session => {
      const roomId = `session-${session._id}`;
      io.to(roomId).emit('member-solved-problem', {
        userId: userId,
        problemId: problemId,
        problemTitle: session.problemId.title,
        sessionId: session._id,
        timestamp: new Date()
      });
    });
  } catch (error) {
    console.error('Notify study groups error:', error);
  }
};

// EXAMPLE: How to integrate into your existing submitCode function
// Find this section in your code and add the notification:

/*
const submitCode = async (req, res) => {
  try {
    // ... your existing submission logic ...
    
    // After creating the submission and it's accepted:
    if (submission.status === 'accepted') {
      // Your existing code to update user's solved problems
      
      // ⭐ ADD THIS: Notify study groups
      const io = req.app.get('io');
      if (io) {
        await notifyStudyGroups(req.user._id, problemId, io);
      }
    }
    
    res.status(200).json({
      success: true,
      submission: submission
    });
  } catch (error) {
    // ... error handling ...
  }
};
*/
module.exports = {submitCode, runCode , notifyStudyGroups};