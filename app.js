import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { sanitizeInput } from './middleware/sanitizeInput.js';
import { autoSeedIfEmpty } from './seed/autoSeed.js';

import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import characterRoutes from './routes/characterRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import merchandiseRoutes from './routes/merchandiseRoutes.js';
import releaseRoutes from './routes/releaseRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import bookmarkRoutes from './routes/bookmarkRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
let databaseInitialization;

const initializeDatabase = () => {
  if (!databaseInitialization) {
    databaseInitialization = connectDB()
      .then(async () => {
        await autoSeedIfEmpty();
      })
      .catch((error) => {
        databaseInitialization = null;
        throw error;
      });
  }

  return databaseInitialization;
};

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(sanitizeInput);
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'https://fan-hub-frontend-rouge.vercel.app',
  process.env.CLIENT_URL
]
  .filter(Boolean)
  .map(url => url.replace(/\/$/, ''));

app.use(cors({
  origin: function (origin, callback) {
    const normalizedOrigin = origin?.replace(/\/$/, '');

    if (!origin || allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      console.log('Blocked CORS Origin:', origin);
      callback(new Error('Origin not allowed by CORS'));
    }
  },
  credentials: true
}));

if (!isProduction) {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Fan Hub Plus API',
    theme: 'Fandom Universe',
    category: 'End-to-End Web Solutions'
  });
});

app.use('/api', async (_req, _res, next) => {
  try {
    await initializeDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/merchandise', merchandiseRoutes);
app.use('/api/releases', releaseRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`
  });
});

app.use(errorHandler);

export default app;