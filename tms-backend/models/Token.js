const mongoose = require('mongoose');

// Define the blueprint for a Token
const tokenSchema = new mongoose.Schema({
  tokenString: { 
    type: String, 
    required: true, 
    unique: true // Security: Ensures no two identical tokens can ever be saved
  },
  userId: { 
    type: String, 
    required: true 
  },
  eventId: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    default: 'Active' 
  },
  expiresAt: { 
    type: Date, 
    required: true 
  }
}, { 
  timestamps: true // Automatically creates 'createdAt' and 'updatedAt' fields
});

// Export the model so our server can use it
module.exports = mongoose.model('Token', tokenSchema);