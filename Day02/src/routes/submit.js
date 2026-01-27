const express = require('express');
const userMiddleware = require('../middleware/userMiddleware');
const submitRouter = express.Router();
const {submitCode, runCode} = require('../controllers/userSubmission');

submitRouter.post('/submit',userMiddleware,submitCode);
submitRouter.post('/run/:id',userMiddleware,runCode);
module.exports = submitRouter;
