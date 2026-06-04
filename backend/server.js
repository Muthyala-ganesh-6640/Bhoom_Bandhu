import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';

// Routes
import authRoutes from './routes/auth.js';
import cropRoutes from './routes/crops.js';
import diseaseRoutes from './routes/disease.js';
import fertilizerRoutes from './routes/fertilizer.js';
import pesticideRoutes from './routes/pesticide.js';
import marketRoutes from './routes/market.js';
import schemeRoutes from './routes/schemes.js';
import weatherRoutes from './routes/weather.js';
import chatbotRoutes from './routes/chatbot.js';
import calendarRoutes from './routes/calendar.js';
import newsRoutes from './routes/news.js';
import locationRoutes from './routes/location.js';
import soilRoutes from './routes/soil.js';
import notificationRoutes from './routes/notifications.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : true,          // allow all origins in development
  credentials: true,
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Global rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use(limiter);

// ── Database ────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bhoomi-bandhu')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/disease', diseaseRoutes);
app.use('/api/fertilizer', fertilizerRoutes);
app.use('/api/pesticide', pesticideRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/soil', soilRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '🌾 Bhoomi Bandhu API is running', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌾 Bhoomi Bandhu server running on http://0.0.0.0:${PORT}`);
});
