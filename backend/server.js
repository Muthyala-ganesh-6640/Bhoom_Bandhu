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
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;

// CORS
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : true,
    credentials: true,
  })
);

// Body Parser
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});

app.use(limiter);

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
  })
  .catch((err) => {
    console.error('❌ MongoDB Error:', err.message);
  });

// Home Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🌾 Bhoomi Bandhu Backend Running',
  });
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🌾 Bhoomi Bandhu API is running',
    timestamp: new Date(),
  });
});

// API Routes
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

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Server Start
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌾 Bhoomi Bandhu Server running on port ${PORT}`);
});