const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const validate = require('../validations/validate');
const { signUpSchema, loginSchema, avatarUploadSchema } = require('../validations/schemas');

// POST /sign-up
router.post('/sign-up', validate(signUpSchema), async (req, res) => {
  try {
    const {
      email,
      name,
      avatar = '',
      bio = '',
      location = '',
      occupation = '',
      socialLinks = {},
      preferences = [],
    } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ message: 'User already exists in database' });
    }

    // Create new user in Mongo
    const newUser = new User({
      email,
      name,
      avatar,
      bio,
      location,
      occupation,
      socialLinks: {
        twitter: socialLinks.twitter || '',
        linkedin: socialLinks.linkedin || '',
        website: socialLinks.website || '',
      },
      preferences: Array.isArray(preferences) ? preferences : [],
    });
    await newUser.save();

    res.status(201).send({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error('Sign-up error:', error);
    res.status(500).send({ message: 'Database registration failed', error: error.message });
  }
});

// POST /upload-avatar
router.post('/upload-avatar', validate(avatarUploadSchema), async (req, res) => {
  try {
    const parsed = { data: req.body };

    const apiKey = process.env.IMGBB_API_KEY;
    const uploadUrl = process.env.IMGBB_UPLOAD_URL || 'https://api.imgbb.com/1/upload';

    if (!apiKey) {
      return res.status(500).send({ message: 'Image upload configuration is missing.' });
    }

    const formData = new FormData();
    formData.append('image', parsed.data.image);

    const response = await fetch(`${uploadUrl}?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result?.success) {
      return res.status(502).send({
        message: result?.error?.message || 'Image upload failed',
      });
    }

    return res.status(200).send({
      message: 'Image uploaded successfully',
      url: result.data.url,
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return res.status(500).send({ message: 'Image upload failed', error: error.message });
  }
});

// POST /login
router.post('/login', validate(loginSchema), async (req, res) => {
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
    const token = jwt.sign({ email: user.email, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

    res.status(200).send({ message: 'Login successful', user, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send({ message: 'Database login fetch failed', error: error.message });
  }
});

module.exports = router;