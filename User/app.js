require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/task');

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_STRING }),
}));

// Routes
app.use('/users', userRoutes);
app.use('/tasks', taskRoutes);

// Start the server and store the server instance
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

setTimeout(() => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server terminated after 1 minute');
    process.exit(0);
  });
}, 60000);
