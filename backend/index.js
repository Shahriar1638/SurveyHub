const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const envPath = fs.existsSync(path.resolve(__dirname, '.env.local')) 
  ? path.resolve(__dirname, '.env.local') 
  : path.resolve(__dirname, '.env');
require('dotenv').config({ path: envPath });

const port = process.env.PORT || 3000;

// ── Trust proxy (required behind Render/reverse proxy for accurate IP detection) ─
app.set('trust proxy', 1);

// ── Request ID (must be first — sets req.id for all downstream middleware) ────
const requestIdMiddleware = require('./middlewares/requestId');
app.use(requestIdMiddleware);

// ── Security Headers ────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,   // disabled — frontend relies on inline styles/scripts
  crossOriginEmbedderPolicy: false,
}));

// ── Rate Limiting ────────────────────────────────────────────────────────────
// General: 100 requests per minute per IP
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// Auth routes: 20 requests per minute per IP (stricter for login/signup)
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again later.' },
});

// Payment routes: 10 requests per minute per IP (prevent abuse)
const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many payment requests, please try again later.' },
});

app.use(generalLimiter);

// middleware
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
  : [
      'http://localhost:5173',
      'https://practice-2-firebase.web.app',
      'https://practice-2-firebase.firebaseapp.com',
      'https://surveyhub-bfmp.onrender.com',
    ];

app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    optionsSuccessStatus: 200
}));
// Use raw body for Stripe webhook, JSON for everything else
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

const getMongoUri = () => {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }

  if (process.env.DB_USER && process.env.DB_PASS) {
    return `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uwwtyq1.mongodb.net/?retryWrites=true&w=majority`;
  }

  throw new Error('Missing MongoDB connection config. Set MONGODB_URI or DB_USER/DB_PASS.');
};

async function run() {
  try {
    // ── Fail-fast if critical env vars are missing ────────────────────────────
    if (!process.env.ACCESS_TOKEN_SECRET) {
      console.error('FATAL: ACCESS_TOKEN_SECRET is not set. Refusing to start.');
      process.exit(1);
    }

    await mongoose.connect(getMongoUri(), {
      dbName: 'surveyDB',
    });

    // Initialize Middlewares
    const { verifyToken, verifyAdmin, verifySurveyor, verifyUser, verifySurveyorOrAdmin } = require('./middlewares/authMiddleware')();

    // Initialize Routes — barrel mounts all domain routers
    const routes = require('./routes');
    app.use(require('./middlewares/authRoutes'));
    app.use('/api/auth', authLimiter, routes.auth);
    app.use('/api/users', verifyToken, routes.users);
    app.use('/api/profile', verifyToken, routes.profile);
    app.use('/api/surveys', routes.surveys);
    app.use('/api/analytics', verifyToken, routes.analytics);
    app.use('/api/homepages/guest', routes.homepages.guest);
    app.use('/api/homepages/user', verifyToken, verifyUser, routes.homepages.user);
    app.use('/api/homepages/surveyor', verifyToken, verifySurveyor, routes.homepages.surveyor);
    app.use('/api/homepages/admin', verifyToken, verifyAdmin, routes.homepages.admin);
    app.use('/api/feedback', routes.feedback);
    app.use('/api/blogs', routes.blogs);
    app.use('/api/payments', paymentLimiter, routes.payments);
    app.use('/api/packages', routes.packages);
    app.use('/api/dashboard', verifyToken, routes.dashboard);
    app.use('/api/usage', routes.usage);
    // Send a ping to confirm a successful connection
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // ── Start survey expiry worker + re-schedule all published surveys ──────
    const { startExpiryWorker, reScheduleAll, closeExpiryWorker } = require('./jobs/surveyExpiry');
    const redis = require('./lib/redis');
    const redisReady = await redis.waitForReady(3000);
    if (redisReady) {
      startExpiryWorker();
      await reScheduleAll();
    } else {
      console.warn('[Startup] Redis not connected — expiry pipeline disabled');
    }

    // Graceful shutdown
    const shutdown = async () => {
      console.log('\nShutting down...');
      await closeExpiryWorker();
      await mongoose.connection.close();
      process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    // ── 404 handler (must be after all routes) ───────────────────────────────
    app.use((req, res) => {
      res.status(404).json({ success: false, message: 'Route not found' });
    });

    // ── Global error handler ──────────────────────────────────────────────────
    app.use((err, req, res, next) => {
      console.error('Unhandled error:', err);
      res.status(500).json({ success: false, message: 'Internal server error' });
    });
  } catch (error) {
    console.error('Failed to initialize MongoDB connection:', error);
    process.exit(1);
  }
}
run();


app.get('/', (req, res) => {
  res.send('Server is running')
})

app.listen(port, () => {
  console.log(`Current active port: ${port}`);
})
module.exports = app;