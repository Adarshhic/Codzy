const express = require('express');
const Authrouter = express.Router();
const {register, login, logout , adminRegister, deleteProfile} = require('../controllers/userAuthent');
const userMiddleware = require('../middleware/userMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { id } = require('ethers');

// Register User
Authrouter.post('/register',register);
Authrouter.post('/login',login);
Authrouter.post('/logout',userMiddleware,logout);
Authrouter.post('/admin/register',adminMiddleware,adminRegister);
Authrouter.delete('/deleteProfile',userMiddleware,deleteProfile);
Authrouter.get('/check',userMiddleware,(req,res)=>{
    const reply={
        _id: req.user._id,
    FirstName: req.user.FirstName,  // ← Capital F to match other responses
    EmailId: req.user.EmailId,      // ← EmailId to match other responses
    role: req.user.role     
        
    }
  res.status(200).json({user:reply,message:'User is authenticated'});
});
//Authrouter.get('/getProfile',getProfile);

module.exports = Authrouter;