import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  phone: { type: String, unique: true, sparse: true, match: /^[6-9]\d{9}$/ },
  email: { type: String, unique: true, sparse: true, lowercase: true },
  googleId: { type: String, unique: true, sparse: true },
  language: { type: String, enum: ['en', 'hi', 'te'], default: 'en' },
  state: { type: String, default: '' },
  district: { type: String, default: '' },
  cropWatchlist: [{ type: String }],
  notificationPreferences: {
    weather: { type: Boolean, default: true },
    pest: { type: Boolean, default: true },
    market: { type: Boolean, default: true },
    scheme: { type: Boolean, default: true },
    calendar: { type: Boolean, default: true },
  },
  savedFields: [{
    name: String,
    nitrogen: Number,
    phosphorus: Number,
    potassium: Number,
    ph: Number,
    createdAt: { type: Date, default: Date.now },
  }],
  otp: { code: String, expiresAt: Date, attempts: { type: Number, default: 0 } },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
