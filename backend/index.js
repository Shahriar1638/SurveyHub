const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config()

const port = process.env.PORT || 3000;

// middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://practice-2-firebase.web.app',
        'https://practice-2-firebase.firebaseapp.com',
        'https://surveyhubserver.vercel.app' 
    ],
    credentials: true,
    optionsSuccessStatus: 200
}));
app.use(express.json());

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
    const { verifyToken, verifyAdmin, verifySurveyor, verifyUser } = require('./middlewares/authMiddleware')();

    // Initialize Routes
    app.use(require('./middlewares/authRoutes'));
    app.use('/api/auth', require('./routes/authRoutes'));
    app.use('/api/users', require('./routes/userRoutes'));
    app.use('/api/surveys', require('./routes/surveyRoutes'));
    app.use('/api/profile', verifyToken, require('./routes/profileRoutes'));
    app.use('/api/homepages/guest', require('./routes/guestHomeRoutes'));
    app.use('/api/homepages/user', require('./routes/userHomeRoutes'));
    app.use('/api/homepages/surveyor', require('./routes/surveyorHomeRoutes'));
    app.use('/api/homepages/admin', require('./routes/adminHomeRoutes'));
    app.use('/api/feedback', require('./routes/feedbackRoutes'));
    app.use('/api/blogs', require('./routes/blogRoutes'));
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