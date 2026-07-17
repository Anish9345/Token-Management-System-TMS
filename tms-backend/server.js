// 1. Import Dependencies
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import the blueprint for our database
const Token = require('./models/Token'); 

// 2. Initialize the Express App
const app = express();

// 3. Global Middleware
app.use(cors());
app.use(express.json());

// 4. Test Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'TMS Backend Server is running securely.' });
});

// 5. API Routes for Tokens

// POST: Create a new token
app.post('/api/tokens', async (req, res) => {
  try {
    const newToken = new Token(req.body); 
    const savedToken = await newToken.save(); 
    res.status(201).json(savedToken); 
  } catch (error) {
    console.error('❌ Error saving token:', error.message);
    res.status(500).json({ message: 'Failed to create token', error: error.message });
  }
});

// GET: Fetch all tokens for a specific user
app.get('/api/tokens/:userId', async (req, res) => {
  try {
    const studentId = req.params.userId;
    const userTokens = await Token.find({ userId: studentId }).sort({ createdAt: -1 }); 
    res.status(200).json(userTokens);
  } catch (error) {
    console.error('❌ Error fetching tokens:', error.message);
    res.status(500).json({ message: 'Failed to fetch tokens', error: error.message });
  }
});

// 6. Database Connection & Server Initialization
const PORT = process.env.PORT || 3000;
const DB_URI = process.env.MONGODB_URI;

mongoose.connect(DB_URI)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB Atlas');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server initialized and listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error.message);
  });