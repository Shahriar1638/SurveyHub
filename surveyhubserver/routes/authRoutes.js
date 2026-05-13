const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /sign-up
router.post('/sign-up', async (req, res) => {
  try {
    const { email, name, avatar } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ message: 'User already exists in database' });
    }

    // Create new user in Mongo
    const newUser = new User({ email, name, avatar });
    await newUser.save();

    res.status(201).send({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error('Sign-up error:', error);
    res.status(500).send({ message: 'Database registration failed', error: error.message });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: 'User not found in database' });
    }

    if (user.status === 'banned') {
      return res.status(403).send({ message: 'User is banned' });
    }

    // Optional: generate JWT if not handled globally
    const token = jwt.sign({ email: user.email, role: user.role }, process.env.ACCESS_TOKEN_SECRET || 'secret', { expiresIn: '1h' });

    res.status(200).send({ message: 'Login successful', user, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send({ message: 'Database login fetch failed', error: error.message });
  }
});

module.exports = router;