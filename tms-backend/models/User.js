const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true // Ensures no two users can register with the same email
  },
  password: { 
    type: String, 
    required: true // We will store the mathematically scrambled password here
  },
  role: { 
    type: String, 
    default: 'Student' // Defaults to Student unless specified as Admin or Teacher
  },
  status: { 
    type: String, 
    default: 'Pending' // Requires Admin approval before they can generate tokens
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);