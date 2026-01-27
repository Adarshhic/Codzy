const mongoose = require('mongoose');
const {Schema} = mongoose;
const userSchema = new Schema({
    FirstName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 20
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
  type: [mongoose.Schema.Types.ObjectId],
  ref: 'Problem',
  default: []
},
    password: {
        type: String,
        required: true,
        minLength: 8
    }
}, {timestamps: true}); 

userSchema.post('findOneAndDelete', async function (userInfo) {
    if (userInfo) {
      await mongoose.model('submission').deleteMany({ userId: userInfo._id });
    }
});

const Users = mongoose.model('User', userSchema);

module.exports = Users;