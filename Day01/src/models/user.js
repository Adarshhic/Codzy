const mongoose = require('mongoose');
const {schema} = mongoose;
const userSchema = new schema({
    FirstName: {
        type: String,
        required: true,
        minlentgth: 3,
        maxlength: 20
    },  
    LastName: {
        type: String,
        minLength: 3,
        maxLength: 20
    },
    EmailId:{
        type: String,
        required: true,
        unique: true,
        trim : true ,
        immutable: true,
        lowercase: true
    },
    age: {
        type: Number,
        min: 6,
        max: 100
    },
    role: {
        type: String,
        enum: ['Admin', 'User'],
        default: 'User'
    },
    problemsSolved: {
        type: [String],
        default: []
    }
}, {timestamps: true}); 

const User = mongoose.model('User', userSchema);

module.exports = User;