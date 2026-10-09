const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Initial setup for admin
router.post('/setup', async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) return res.status(400).json({ message: 'Admin already exists' });
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({ username: 'admin', password: hashedPassword, role: 'admin', name: 'System Admin' });
    await admin.save();
    res.json({ message: 'Admin setup successful (username: admin, password: admin123)' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET || 'secret123', { expiresIn: '1d' });
    res.json({ token, role: user.role, name: user.name, assignedQuestions: user.assignedQuestions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
