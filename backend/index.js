const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const envPath = fs.existsSync(path.resolve(__dirname, '.env.local')) 
  ? path.resolve(__dirname, '.env.local') 
  : path.resolve(__dirname, '.env');
require('dotenv').config({ path: envPath });


const port = process.env.PORT || 3000;

// middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://practice-2-firebase.web.app',
        'https://practice-2-firebase.firebaseapp.com',
        'https://surveyhub-bfmp.onrender.com' 
    ],
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
    await mongoose.connect(getMongoUri(), {
      dbName: 'surveyDB',
    });

    // Initialize Middlewares
    const { verifyToken, verifyAdmin, verifySurveyor, verifyUser, verifySurveyorOrAdmin } = require('./middlewares/authMiddleware')();

    // Initialize Routes
    app.use(require('./middlewares/authRoutes'));
    app.use('/api/auth', require('./routes/authRoutes'));
    app.use('/api/users', verifyToken, require('./routes/userRoutes'));
    app.use('/api/surveys', require('./routes/surveyRoutes'));
    app.use('/api/profile', verifyToken, require('./routes/profileRoutes'));
    app.use('/api/homepages/guest', require('./routes/guestHomeRoutes'));
    app.use('/api/homepages/user', verifyToken, verifyUser, require('./routes/userHomeRoutes'));
    app.use('/api/homepages/surveyor', verifyToken, verifySurveyor, require('./routes/surveyorHomeRoutes'));
    app.use('/api/homepages/admin', verifyToken, verifyAdmin, require('./routes/adminHomeRoutes'));
    app.use('/api/feedback', require('./routes/feedbackRoutes'));
    app.use('/api/blogs', require('./routes/blogRoutes'));
    app.use('/api/payments', require('./routes/paymentRoutes'));
    // Send a ping to confirm a successful connection
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
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