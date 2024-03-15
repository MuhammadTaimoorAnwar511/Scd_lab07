const express = require('express');
const Task = require('../models/Task');
const router = express.Router();

// Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.status(403).send({ message: 'Not authorized' });
}

// Create a task with category and priority
router.post('/', isLoggedIn, async (req, res) => {
  try {
    let task = new Task({ ...req.body, user: req.session.userId });
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all tasks for logged-in user, with sorting options
router.get('/', isLoggedIn, async (req, res) => {
  try {
    const { sortBy = 'dueDate' } = req.query; 
    let sort = {};

    switch (sortBy) {
      case 'dueDate':
        sort = { dueDate: 1 };
        break;
      case 'category':
        sort = { category: 1 };
        break;
      case 'completed':
        sort = { completed: 1 };
        break;
      case 'priority':
        sort = { priority: 1 }; // Assuming priority is stored as integers or a comparable format
        break;
      default:
        break;
    }

    const tasks = await Task.find({ user: req.session.userId }).sort(sort);
    res.send(tasks);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update task status to completed
router.patch('/:taskId/complete', isLoggedIn, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.taskId, user: req.session.userId },
      { $set: { completed: true } },
      { new: true }
    );
    if (!task) {
      return res.status(404).send({ message: 'Task not found' });
    }
    res.send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Update task priority
router.patch('/:taskId/priority', isLoggedIn, async (req, res) => {
  try {
    const { priority } = req.body; // Expect priority to be provided in the request
    const task = await Task.findOneAndUpdate(
      { _id: req.params.taskId, user: req.session.userId },
      { $set: { priority } },
      { new: true }
    );
    if (!task) {
      return res.status(404).send({ message: 'Task not found' });
    }
    res.send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
