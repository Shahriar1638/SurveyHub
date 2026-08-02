const express = require('express');
const router = express.Router();
const User = require('../../models/User');

// GET /api/users/:email - Fetch a single user profile by email (safe fields only)
router.get('/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ email })
      .select('name email avatar role status bio location occupation socialLinks preferences autoAIInsight createdAt')
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found in database" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user by email:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
