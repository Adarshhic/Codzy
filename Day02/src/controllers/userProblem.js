const { runCodeWithPiston } = require('../utils/problemUtility');
const prisma = require('../config/prisma');
const { generateId } = require('../utils/idGenerator');
const serializeWithId = require('../utils/responseSerializer');

const CreateProblem = async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      tags,
      visibleTestCases,
      hiddenTestCases,
      startCode,
      referenceSolutions
    } = req.body;

    const creatorId = req.user.id || req.user._id;

    // 🔁 Check each reference solution
    if (referenceSolutions && visibleTestCases) {
      for (const { language, CompleteCode } of referenceSolutions) {
        for (const testCase of visibleTestCases) {
          const input = Array.isArray(testCase.input) ? testCase.input.join('\n') : (testCase.input || '');
          const expectedOutput = Array.isArray(testCase.output) ? testCase.output.join('\n').trim() : (testCase.output || '').trim();

          const result = await runCodeWithPiston({
            language,
            code: CompleteCode,
            input
          });

          const actualOutput = (result.stdout || '').trim();

          if (actualOutput !== expectedOutput) {
            return res.status(400).json({
              message: "Reference solution is not passing all test cases"
            });
          }

          if (result.stderr) {
            return res.status(400).json({
              message: "Reference solution has runtime/compile error",
              error: result.stderr
            });
          }
        }
      }
    }

    const problemId = generateId();

    const userProblem = await prisma.problem.create({
      data: {
        id: problemId,
        title,
        description,
        difficulty,
        tags,
        visibleTestCases,
        hiddenTestCases,
        startCode,
        referenceSolutions,
        problemCreatorId: creatorId
      }
    });

    res.status(201).json({
      message: "Problem created successfully",
      problemId: userProblem.id
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

const UpdateProblem = async (req, res) => {
  try {
    const { id } = req.params;

    const problem = await prisma.problem.findUnique({
      where: { id }
    });
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    if (req.body.referenceSolutions && req.body.visibleTestCases) {
      const { referenceSolutions, visibleTestCases } = req.body;

      for (const { language, CompleteCode } of referenceSolutions) {
        for (const testCase of visibleTestCases) {
          const input = Array.isArray(testCase.input) ? testCase.input.join('\n') : (testCase.input || '');
          const expectedOutput = Array.isArray(testCase.output) ? testCase.output.join('\n').trim() : (testCase.output || '').trim();

          const result = await runCodeWithPiston({
            language,
            code: CompleteCode,
            input
          });

          if (result.stderr) {
            return res.status(400).json({
              message: "Reference solution has error",
              error: result.stderr
            });
          }

          if ((result.stdout || '').trim() !== expectedOutput) {
            return res.status(400).json({
              message: "Reference solution failed test cases"
            });
          }
        }
      }
    }

    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData._id;

    const updatedProblem = await prisma.problem.update({
      where: { id },
      data: updateData
    });

    res.status(200).json({
      message: "Problem updated successfully",
      problem: serializeWithId(updatedProblem)
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

const DeleteProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    const problem = await prisma.problem.findUnique({
      where: { id }
    });
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    if (problem.problemCreatorId !== userId && req.user.role !== 'Admin') {
      return res.status(403).json({ message: "Forbidden: Not allowed to delete this problem" });
    }

    await prisma.problem.delete({
      where: { id }
    });

    res.status(200).json({ message: "Problem deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

const getProblemById = async (req, res) => {
  try {
    const { id } = req.params;

    const problem = await prisma.problem.findUnique({
      where: { id }
    });
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    const video = await prisma.solutionVideo.findFirst({
      where: { problemId: id }
    });

    if (video) {
      const responseData = serializeWithId({
        ...problem,
        secureUrl: video.secureUrl,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration
      });
      return res.status(200).json(responseData);
    }

    const responseProblem = serializeWithId({
      _id: problem.id,
      id: problem.id,
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      tags: problem.tags,
      visibleTestCases: problem.visibleTestCases,
      startCode: problem.startCode
    });

    res.status(200).json({ problem: responseProblem });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getAllProblem = async (req, res) => {
  try {
    const problems = await prisma.problem.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        tags: true,
        visibleTestCases: true,
        startCode: true
      }
    });

    const responseProblems = problems.map(problem => serializeWithId({
      _id: problem.id,
      id: problem.id,
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      tags: problem.tags,
      visibleTestCases: problem.visibleTestCases,
      startCode: problem.startCode
    }));

    res.status(200).json({ problems: responseProblems });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const solvedAllProblembyUser = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const solvedRecords = await prisma.userSolvedProblem.findMany({
      where: { userId },
      include: {
        problem: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            tags: true
          }
        }
      }
    });

    const problems = solvedRecords.map(r => serializeWithId(r.problem));

    res.status(200).json({
      count: problems.length,
      problems
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

const submittedProblem = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const problemId = req.params.id;

    const submissions = await prisma.submission.findMany({
      where: { userId, problemId },
      orderBy: { createdAt: 'desc' }
    });

    if (submissions.length === 0) {
      return res.status(200).json({
        message: "No Submission is present",
        submissions: []
      });
    }

    res.status(200).json(serializeWithId(submissions));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

module.exports = {
  CreateProblem,
  UpdateProblem,
  DeleteProblem,
  getProblemById,
  getAllProblem,
  solvedAllProblembyUser,
  submittedProblem
};