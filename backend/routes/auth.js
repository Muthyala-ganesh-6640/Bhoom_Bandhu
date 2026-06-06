console.log("✅ Auth routes loaded");
import axios from 'axios';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { rateLimit } from 'express-rate-limit';

// Robust client IP extractor (avoids using `req.ip` to satisfy express-rate-limit checks)
const getClientIp = (req) => {
  const xff = req.headers['x-forwarded-for'];
  const ip = (typeof xff === 'string' && xff.split(',')[0].trim()) || req.socket?.remoteAddress || req.connection?.remoteAddress || '';
  // Normalize IPv4-mapped IPv6 addresses like ::ffff:127.0.0.1
  return ip.replace(/^::ffff:/, '');
};
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  // Use phone number when provided, otherwise fall back to a normalized client IP
  keyGenerator: (req) => req.body?.phone || getClientIp(req) || '',
  message: { success: false, message: 'Too many OTP requests. Try again after 10 minutes.' },
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });

// POST /api/auth/send-otp
router.post('/send-otp', otpLimiter, async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Invalid phone number. Enter 10-digit Indian mobile number.' });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await User.findOneAndUpdate(
      { phone },
      { $set: { otp: { code: otp, expiresAt, attempts: 0 } } },
      { upsert: true, new: true }
    );

    // TODO: integrate SMS provider (Twilio/MSG91)
    try {
  await axios.post(
    'https://control.msg91.com/api/v5/otp',
    {
      mobile: `91${phone}`,
      otp: otp
    },
    {
      headers: {
        authkey: process.env.MSG91_AUTH_KEY,
        'Content-Type': 'application/json'
      }
    }
  );

  console.log(`OTP sent successfully to ${phone}`);
} catch (smsError) {
  console.error('MSG91 Error:', smsError.response?.data || smsError.message);

  return res.status(500).json({
    success: false,
    message: 'Failed to send OTP'
  });
}
    res.json({ success: true, message: 'OTP sent successfully', devOtp: process.env.NODE_ENV === 'development' ? otp : undefined });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp, name } = req.body;
    if (!phone || !otp) return res.status(400).json({ success: false, message: 'Phone and OTP required' });

    const user = await User.findOne({ phone });
    if (!user?.otp?.code) return res.status(400).json({ success: false, message: 'No OTP found. Request a new one.' });

    if (user.otp.attempts >= 3) {
      return res.status(400).json({ success: false, message: 'Too many failed attempts. Request a new OTP.' });
    }

    if (user.otp.code !== otp) {
      await User.findByIdAndUpdate(user._id, { $inc: { 'otp.attempts': 1 } });
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }

    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({ success: false, message: 'OTP expired. Request a new one.' });
    }

    const isNewUser = !user.name && name;
    await User.findByIdAndUpdate(user._id, {
      $set: { otp: {}, ...(isNewUser ? { name } : {}) },
    });

    const token = signToken(user._id);
    res.json({ success: true, token, user: { id: user._id, name: user.name || name, phone, language: user.language }, isNewUser: !user.name });
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

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-otp');
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
