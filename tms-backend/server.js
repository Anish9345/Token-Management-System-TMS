// 1. Import Dependencies
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 2. Initialize the Express App
const app = express();

// 3. Global Middleware
app.use(cors()); 
app.use(express.json()); 

// 4. Test Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'TMS Backend Server is running securely.' });
});

// 5. Database Connection & Server Initialization
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