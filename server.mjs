// server.mjs

import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/loginapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// User model
const UserSchema = new mongoose.Schema({
  name: String,
  phoneNumber: String,
  email: String,
});

const User = mongoose.model('User', UserSchema);

// Serve static HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// POST route for user registration
app.post('/api/register', async (req, res) => {
  try {
    const { name, phoneNumber, email } = req.body;
    
    const newUser = new User({
      name,
      phoneNumber,
      email,
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while registering the user' });
  }
});

// GET route to retrieve user information
app.get('/api/user/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const user = await User.findOne({ name });

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while retrieving user information' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});