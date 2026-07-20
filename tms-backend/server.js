// 1. Import Dependencies
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import Data Models
const Token = require('./models/Token');
const User = require('./models/User');
const Event = require('./models/Event');
const verifyToken = require('./middleware/auth'); // Security middleware

// 2. Initialize App
const app = express();

// 3. Global Middleware
app.use(cors({
  origin: 'https://token-management-system-tms.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 4. Robust Database Connection Helper
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

// 5. Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'TMS Backend Server is running.' });
});

// AUTHENTICATION ROUTES
app.post('/api/signup', async (req, res) => {
  try {
    await connectDB();
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email is already registered.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword, role: role || 'Student', status: 'Pending' });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password.' });
    if (user.status === 'Pending') return res.status(403).json({ message: 'Account pending admin approval.' });

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.status(200).json({
      message: 'Login successful',
      token: token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.' });
  }
});

app.get('/api/profile', verifyToken, async (req, res) => {
  try {
    await connectDB();
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// TOKEN ROUTES
app.post('/api/tokens', verifyToken, async (req, res) => {
  try {
    await connectDB();
    const savedToken = await new Token(req.body).save();
    res.status(201).json(savedToken);
  } catch (error) { res.status(500).json({ message: 'Failed to create token' }); }
});

app.get('/api/tokens/user/:userId', verifyToken, async (req, res) => {
  try {
    await connectDB();
    const userTokens = await Token.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(userTokens);
  } catch (error) { res.status(500).json({ message: 'Failed to fetch tokens' }); }
});

app.get('/api/tokens/search/:tokenString', verifyToken, async (req, res) => {
  try {
    await connectDB();
    const token = await Token.findOne({ tokenString: req.params.tokenString });
    if (!token) return res.status(404).json({ message: 'Token not found.' });
    res.status(200).json(token);
  } catch (error) { res.status(500).json({ message: 'Server error while searching token.' }); }
});

app.patch('/api/tokens/:tokenId/use', verifyToken, async (req, res) => {
  try {
    await connectDB();
    const updatedToken = await Token.findByIdAndUpdate(req.params.tokenId, { status: 'Used' }, { new: true });
    if (!updatedToken) return res.status(404).json({ message: 'Token not found.' });
    res.status(200).json(updatedToken);
  } catch (error) { res.status(500).json({ message: 'Failed to update token status.' }); }
});

// ADMIN ROUTES
app.get('/api/users', verifyToken, async (req, res) => {
  try {
    await connectDB();
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
  } catch (error) { res.status(500).json({ message: 'Failed to fetch users' }); }
});

app.patch('/api/users/:userId', verifyToken, async (req, res) => {
  try {
    await connectDB();
    const updatedUser = await User.findByIdAndUpdate(req.params.userId, { $set: req.body }, { new: true }).select('-password');
    res.status(200).json(updatedUser);
  } catch (error) { res.status(500).json({ message: 'Failed to update user' }); }
});

app.get('/api/events', verifyToken, async (req, res) => {
  try {
    await connectDB();
    const events = await Event.find({});
    res.status(200).json(events);
  } catch (error) { res.status(500).json({ message: 'Failed to fetch events' }); }
});

app.post('/api/events', verifyToken, async (req, res) => {
  try {
    await connectDB();
    const savedEvent = await new Event(req.body).save();
    res.status(201).json(savedEvent);
  } catch (error) { res.status(500).json({ message: 'Failed to create event' }); }
});

app.patch('/api/events/:eventId', verifyToken, async (req, res) => {
  try {
    await connectDB();
    const updated = await Event.findByIdAndUpdate(req.params.eventId, req.body, { new: true });
    res.status(200).json(updated);
  } catch (error) { res.status(500).json({ message: 'Failed to update event' }); }
});

app.delete('/api/events/:eventId', verifyToken, async (req, res) => {
  try {
    await connectDB();
    await Event.findByIdAndDelete(req.params.eventId);
    res.status(200).json({ message: 'Deleted' });
  } catch (error) { res.status(500).json({ message: 'Failed to delete' }); }
});

app.get('/api/tokens', verifyToken, async (req, res) => {
  try {
    await connectDB();
    const allTokens = await Token.find({}).sort({ createdAt: -1 });
    res.status(200).json(allTokens);
  } catch (error) { res.status(500).json({ message: 'Failed to fetch audit log' }); }
});

app.patch('/api/tokens/:tokenId/revoke', verifyToken, async (req, res) => {
  try {
    await connectDB();
    const t = await Token.findByIdAndUpdate(req.params.tokenId, { status: 'Expired' }, { new: true });
    res.status(200).json(t);
  } catch (error) { res.status(500).json({ message: 'Failed to revoke' }); }
});

app.delete('/api/tokens', verifyToken, async (req, res) => {
  try {
    await connectDB();
    await Token.deleteMany({});
    res.status(200).json({ message: 'Cleared' });
  } catch (error) { res.status(500).json({ message: 'Failed to clear' }); }
});

module.exports = app;