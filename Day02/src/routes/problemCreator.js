const express = require('express');
const { get } = require('mongoose');


const problemRouter = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const { CreateProblem, UpdateProblem  , DeleteProblem , getProblemById , getAllProblem , solvedAllProblembyUser,submittedProblem} = require('../controllers/userProblem');
const userMiddleware = require('../middleware/userMiddleware'); 


//Admin Specific Routes
problemRouter.post('/create', adminMiddleware,CreateProblem);
problemRouter.patch('/update/:id',adminMiddleware, UpdateProblem);
problemRouter.delete('/delete/:id', adminMiddleware, DeleteProblem);

// // User Specific Routes
 problemRouter.get('/problemById/:id',userMiddleware, getProblemById);
 problemRouter.get('/getAllProblem',userMiddleware, getAllProblem);
 problemRouter.get('/problemSolvedByUser',userMiddleware, solvedAllProblembyUser);
problemRouter.get('/submittedProblem/:id',userMiddleware, submittedProblem)
module.exports = problemRouter;