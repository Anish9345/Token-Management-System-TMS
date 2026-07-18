// 1. Import Dependencies
require('dotenv').config(); // Load environment variables (like DB_URI and JWT_SECRET)
const express = require('express'); // Web framework to handle HTTP requests
const mongoose = require('mongoose'); // Library to talk to MongoDB
const cors = require('cors'); // Middleware to allow Angular to talk to Node.js
const bcrypt = require('bcryptjs'); // Library to scramble/hash passwords
const jwt = require('jsonwebtoken'); // Library to create secure login sessions

// Import Data Models (Blueprints for our MongoDB collections)
const Token = require('./models/Token');
const User = require('./models/User');
const Event = require('./models/Event');
const verifyToken = require('./middleware/auth'); // Security middleware to check JWT

// 2. Initialize the Express App
const app = express();

// 3. Global Middleware
app.use(cors()); // Enables cross-origin requests (Angular <-> Node)
app.use(express.json()); // Allows the server to understand JSON data from Angular

// 4. Test Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'TMS Backend Server is running securely.' });
});

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// SIGNUP: Receives data from Angular, hashes the password, saves to DB
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    // Hash the password so it's never stored in plain text
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new User instance with 'Pending' status
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'Student',
      status: 'Pending',
    });

    await newUser.save(); // Write to MongoDB
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// LOGIN: Authenticates credentials and returns a 2-hour JWT
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password.' });

    // Compare provided password with hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password.' });

    // Prevent login if Admin hasn't approved the account
    if (user.status === 'Pending') {
      return res.status(403).json({ message: 'Account pending admin approval.' });
    }

    // Sign a token that expires in 2 hours
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '2h',
    });

    // Send the token and user details back for the frontend to store
    res.status(200).json({
      message: 'Login successful',
      token: token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// ==========================================
// STUDENT/TEACHER TOKEN ROUTES
// ==========================================

// POST: Save a new token created by a student
app.post('/api/tokens', verifyToken, async (req, res) => {
  try {
    const newToken = new Token(req.body);
    const savedToken = await newToken.save();
    res.status(201).json(savedToken);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create token' });
  }
});

// GET: Fetch history of tokens for one student
app.get('/api/tokens/user/:userId', verifyToken, async (req, res) => {
  try {
    const userTokens = await Token.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(userTokens);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tokens' });
  }
});

// ==========================================
// ADMIN ROUTES (USERS MANAGEMENT)
// ==========================================

// GET: Send full user list (excluding passwords) for Admin Users page
app.get('/api/users', verifyToken, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// PATCH: Change user role or approval status
app.patch('/api/users/:userId', verifyToken, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: req.body },
      { new: true },
    ).select('-password');
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// ==========================================
// ADMIN ROUTES (EVENTS MANAGEMENT)
// ==========================================

// GET: Fetch list of all events for Admin Events page
app.get('/api/events', verifyToken, async (req, res) => {
  try {
    const events = await Event.find({});
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch events' });
  }
});

// POST: Add a new event to the list
app.post('/api/events', verifyToken, async (req, res) => {
  try {
    const savedEvent = await new Event(req.body).save();
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create event' });
  }
});

// PATCH: Edit an existing event's details
app.patch('/api/events/:eventId', verifyToken, async (req, res) => {
  try {
    const updated = await Event.findByIdAndUpdate(req.params.eventId, req.body, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update event' });
  }
});

// DELETE: Remove an event from the database
app.delete('/api/events/:eventId', verifyToken, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.eventId);
    res.status(200).json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete' });
  }
});

// ==========================================
// ADMIN ROUTES (TOKEN AUDIT LOG)
// ==========================================

// GET: Fetch all tokens generated by all students
app.get('/api/tokens', verifyToken, async (req, res) => {
  try {
    const allTokens = await Token.find({}).sort({ createdAt: -1 });
    res.status(200).json(allTokens);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch audit log' });
  }
});

// PATCH: Manually revoke a specific token if security is breached
app.patch('/api/tokens/:tokenId/revoke', verifyToken, async (req, res) => {
  try {
    const t = await Token.findByIdAndUpdate(
      req.params.tokenId,
      { status: 'Expired' },
      { new: true },
    );
    res.status(200).json(t);
  } catch (error) {
    res.status(500).json({ message: 'Failed to revoke' });
  }
});

// DELETE: Delete all records from the Token Audit Log
app.delete('/api/tokens', verifyToken, async (req, res) => {
  try {
    await Token.deleteMany({});
    res.status(200).json({ message: 'Cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear' });
  }
});

// 6. Database Connection & Start Server
const PORT = process.env.PORT || 3000;
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
  })
  .catch((err) => console.error('❌ Connection error:', err.message));
