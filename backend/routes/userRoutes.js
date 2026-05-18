const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/users/:email - Fetch a single user profile by email
router.get('/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found in database" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user by email:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

module.exports = router;
