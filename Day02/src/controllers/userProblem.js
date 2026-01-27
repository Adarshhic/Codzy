const { runCodeWithPiston } = require('../utils/problemUtility');
const User = require("../models/user"); // <- Add this line
const Problem = require("../models/problem");
const Submission = require("../models/Submission");
const SolutionVideo = require("../models/solutionVideo");

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

    // 🔁 Check each reference solution
    for (const { language, CompleteCode } of referenceSolutions) {

      // 🔁 Run reference solution on each visible test case
      for (const testCase of visibleTestCases) {

        const input = testCase.input.join('\n');
        const expectedOutput = testCase.output.join('\n').trim();

        const result = await runCodeWithPiston({
          language,
          code: CompleteCode,
          input
        });

        const actualOutput = result.stdout.trim();

        // ❌ If output mismatch
        if (actualOutput !== expectedOutput) {
          return res.status(400).json({
            message: "Reference solution is not passing all test cases"
          });
        }

        // ❌ Runtime / compilation error
        if (result.stderr) {
          return res.status(400).json({
            message: "Reference solution has runtime/compile error",
            error: result.stderr
          });
        }
      }
    }

    // ✅ Save problem in DB
    const userProblem = await Problem.create({
      title,
      description,
      difficulty,
      tags,
      visibleTestCases,
      hiddenTestCases,
      startCode,
      referenceSolutions,
      problemCreator: req.user._id
    });

    res.status(201).json({
      message: "Problem created successfully",
      problemId: userProblem._id
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};


  // Implementation for updating a problem
 const UpdateProblem = async (req, res) => {
  try {
    const { id } = req.params;

    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    if (req.body.referenceSolutions && req.body.visibleTestCases) {
      const { referenceSolutions, visibleTestCases } = req.body;

      for (const { language, CompleteCode } of referenceSolutions) {
        for (const testCase of visibleTestCases) {

          const input = testCase.input.join('\n');
          const expectedOutput = testCase.output.join('\n').trim();

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

          if (result.stdout.trim() !== expectedOutput) {
            return res.status(400).json({
              message: "Reference solution failed test cases"
            });
          }
        }
      }
    }

    const updatedProblem = await Problem.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Problem updated successfully",
      problem: updatedProblem
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

    // 1️⃣ Check if the problem exists
    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    // 2️⃣ Optional: Only the creator or admin can delete
    if (problem.problemCreator.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Forbidden: Not allowed to delete this problem" });
    }

    // 3️⃣ Delete the problem
    await Problem.findByIdAndDelete(id);

    res.status(200).json({ message: "Problem deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
}


// GET Problem by ID (user-specific)
const getProblemById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Find problem by ID
    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    // 2️⃣ Optional: You can hide hiddenTestCases for normal users
    const responseProblem = {
      _id: problem._id,
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      tags: problem.tags,
      visibleTestCases: problem.visibleTestCases,
      startCode: problem.startCode,
      // Do NOT send hiddenTestCases to users
    };
 
      if(!problem)
         return res.status(404).send("Problem is Missing");
     
        const videos = await SolutionVideo.findOne({problemId:id});
     
        if(videos){   
         
        const responseData = {
         ...problem.toObject(),
         secureUrl:videos.secureUrl,
         thumbnailUrl : videos.thumbnailUrl,
         duration : videos.duration,
        } 
       
        return res.status(200).send(responseData);
        }
         

    res.status(200).json({ problem: responseProblem });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// GET all problems (user-specific)
const getAllProblem = async (req, res) => {
  try {
    // 1️⃣ Fetch all problems from DB
    const problems = await Problem.find({}).select('_id title difficulty tags');;
       if(problems.length==0)
    return res.status(404).send("Problem is Missing");

    // 2️⃣ Map to hide hiddenTestCases from normal users
    const responseProblems = problems.map(problem => ({
      _id: problem._id,
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      tags: problem.tags,
      visibleTestCases: problem.visibleTestCases,
      startCode: problem.startCode
      // hiddenTestCases not included
    }));

    res.status(200).json({ problems: responseProblems });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const solvedAllProblembyUser = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find user and populate solved problems
    const user = await User.findById(userId)
      .populate({
        path: 'problemsSolved',
        select: '_id title difficulty tags'
      });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json({
      count: user.problemsSolved.length,
      problems: user.problemsSolved
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

// In submittedProblem function (around line 248)
const submittedProblem = async (req, res) => { 
  try {
    const userId = req.user._id;
    const problemId = req.params.id; // ✅ Now matches route parameter
    const ans = await Submission.find({userId, problemId});
  
    if (ans.length == 0) {
      return res.status(200).json({ // ✅ Added return and changed to json
        message: "No Submission is present", 
        submissions: [] 
      });
    }

    res.status(200).json(ans); // ✅ Changed to json
  } catch (err) {
    console.error(err); // ✅ Log the error for debugging
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
}
module.exports = { CreateProblem, UpdateProblem , DeleteProblem, getProblemById , getAllProblem  , solvedAllProblembyUser, submittedProblem };