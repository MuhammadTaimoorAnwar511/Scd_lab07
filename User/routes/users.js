const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/Users');
const router = express.Router();

// User registration
router.post('/register', async (req, res) => {
  try {
    let { username, password } = req.body;
    let user = new User({ username, password });
    await user.save();
    res.status(201).send({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).send(error);
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send({ message: 'Authentication failed' });
    }
    req.session.userId = user._id;
    res.send({ message: 'Logged in successfully' });
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
