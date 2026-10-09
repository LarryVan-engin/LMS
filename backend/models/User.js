const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // will be hashed
  role: { type: String, enum: ['admin', 'client'], default: 'client' },
  name: String,
  email: String,
  organization: String,
  assignedQuestions: { type: Number, default: 0 } // Number of questions assigned for the test, 0 means no test
});

module.exports = mongoose.model('User', userSchema);
