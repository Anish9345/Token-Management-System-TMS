// 1. Import Dependencies
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import Blueprints and Middleware
const Token = require('./models/Token'); 
const User = require('./models/User');
const verifyToken = require('./middleware/auth');

// 2. Initialize the Express App
const app = express();

// 3. Global Middleware
app.use(cors());
app.use(express.json());

// 4. Test Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'TMS Backend Server is running securely.' });
});

// --- AUTHENTICATION ROUTES ---

// SIGNUP: Create a new user securely
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    // Hash (scramble) the password with a "salt" of 10 rounds
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save the user to the database with the scrambled password
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'Student'
    });
    
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully. Waiting for admin approval.' });
  } catch (error) {
    console.error('❌ Error during signup:', error.message);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// 2. LOGIN: The "Ticket Booth" that issues the 2-hour JWT
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by their email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Compare the plain text password from Angular with the scrambled password in MongoDB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Check if the user is approved by an admin
    if (user.status === 'Pending') {
      return res.status(403).json({ message: 'Account pending admin approval.' });
    }

    // --- THIS IS WHERE THE TIMER IS SET ---
    // Generate the secure JWT. We hide the user's ID and Role inside it.
    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '2h' } // The official 2-hour expiration timer
    );

    // Send the token and user data back to the Angular frontend
    res.status(200).json({
      message: 'Login successful',
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Error during login:', error.message);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// --- SECURE TOKEN ROUTES ---
// Notice we inserted `verifyToken` in the middle of these routes!

// POST: Create a new token (Protected)
app.post('/api/tokens', verifyToken, async (req, res) => {
  try {
    const newToken = new Token(req.body); 
    const savedToken = await newToken.save(); 
    res.status(201).json(savedToken); 
  } catch (error) {
    console.error('❌ Error saving token:', error.message);
    res.status(500).json({ message: 'Failed to create token', error: error.message });
  }
});

// GET: Fetch all tokens for a specific user (Protected)
app.get('/api/tokens/:userId', verifyToken, async (req, res) => {
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