const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const problemSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  tags: {
    type: String,
    enum: [
      'Array',
      'String',
      'LinkedList',
      'Tree',
      'Graph',
      'Dynamic Programming',
      'Math'
    ],
    required: true
  },
  visibleTestCases: [
    {
      input: { type: [String], required: true },
      output: { type: [String], required: true },
      explanation: { type: String, required: true }
    }
  ],
  hiddenTestCases: [
    {
      input: { type: [String], required: true },
      output: { type: [String], required: true }
    }
  ],
  startCode: [
    {
      Language: {
        type: String,
        enum: ['C++', 'Java', 'JavaScript'],
        required: true
      },
      initialCode: { type: String, required: true }
    }
  ],
  referenceSolutions: [
    {
      language: {
        type: String,
        enum: ['C++', 'Java', 'JavaScript', 'Python3'],
        required: true
      },
      CompleteCode: { type: String, required: true }
    }
  ],
  problemCreator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const Problem =
  mongoose.models.Problem ||
  mongoose.model('Problem', problemSchema);

module.exports = Problem;
