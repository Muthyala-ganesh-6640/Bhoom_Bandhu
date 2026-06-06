console.log("✅ Auth routes loaded");
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { phone, email, password, name } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password is required and must be at least 6 characters.' });
    }
    if (!phone && !email) {
      return res.status(400).json({ success: false, message: 'Phone number or email is required.' });
    }
    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Invalid phone number. Enter 10-digit Indian mobile number.' });
    }
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required.' });
    }

    const existingUser = await User.findOne({ $or: [ ...(phone ? [{ phone }] : []), ...(email ? [{ email }] : []) ] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'A user with this phone or email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ phone, email, password: hashedPassword, name, isActive: true });

    const token = signToken(user._id);
    res.json({ success: true, token, user: { id: user._id, name: user.name, phone: user.phone, email: user.email, language: user.language } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { phone, email, password } = req.body;
    if (!password || !(phone || email)) {
      return res.status(400).json({ success: false, message: 'Phone or email and password are required.' });
    }

    const query = phone ? { phone } : { email };
    const user = await User.findOne(query).select('+password');
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials.' });
    }

    const match = await bcrypt.compare(password, user.password || '');
    if (!match) {
      return res.status(400).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = signToken(user._id);
    res.json({ success: true, token, user: { id: user._id, name: user.name, phone: user.phone, email: user.email, language: user.language } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body;
    if (!googleId || !email) return res.status(400).json({ success: false, message: 'Google credentials required' });

    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    const isNewUser = !user;

    if (!user) {
      user = await User.create({ googleId, email, name, isActive: true });
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    const token = signToken(user._id);
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, language: user.language }, isNewUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, language, state, district, cropWatchlist, notificationPreferences } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (language && ['en', 'hi', 'te'].includes(language)) updates.language = language;
    if (state) updates.state = state;
    if (district) updates.district = district;
    if (cropWatchlist) updates.cropWatchlist = cropWatchlist;
    if (notificationPreferences) updates.notificationPreferences = notificationPreferences;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/auth/account
router.delete('/account', protect, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
