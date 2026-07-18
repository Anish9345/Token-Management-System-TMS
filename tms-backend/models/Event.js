const mongoose = require('mongoose');

// Define the blueprint for an Event
const eventSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  location: { 
    type: String, 
    required: true 
  }
}, { 
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Export the model so server.js can use it to talk to the database
module.exports = mongoose.model('Event', eventSchema);