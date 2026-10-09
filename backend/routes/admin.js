const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const User = require('../models/User');
const Question = require('../models/Question');
const Score = require('../models/Score');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/authMiddleware');

const upload = multer({ dest: 'uploads/' });

// Apply middleware for all admin routes
router.use(authMiddleware(['admin']));

// Get all clients
router.get('/clients', async (req, res) => {
  try {
    const clients = await User.find({ role: 'client' }, '-password');
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new client
router.post('/clients', async (req, res) => {
  try {
    const { username, password, name, email, organization } = req.body;
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: 'Username already exists' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role: 'client', name, email, organization });
    await user.save();
    res.status(201).json({ message: 'Client created', user: { username, name, email, organization } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update client (including assign questions)
router.put('/clients/:id', async (req, res) => {
  try {
    const { name, email, organization, assignedQuestions } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { name, email, organization, assignedQuestions }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete client
router.delete('/clients/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Score.deleteMany({ userId: req.params.id });
    res.json({ message: 'Client deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all scores
router.get('/scores', async (req, res) => {
  try {
    const scores = await Score.find().populate('userId', 'username name organization');
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload Excel Question Bank
router.post('/upload-excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const wb = xlsx.readFile(req.file.path);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(ws, { header: 1 }); // 2D array

    let questions = [];
    let startRow = -1;

    // Find header row
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === 'STT' || data[i][1] === 'Câu hỏi') {
        startRow = i + 1;
        break;
      }
    }

    if (startRow === -1) {
      return res.status(400).json({ message: 'Invalid Excel format' });
    }

    for (let i = startRow; i < data.length; i++) {
      const row = data[i];
      if (!row || !row[1]) continue; // Skip empty rows or rows without question text

      const questionText = row[1];
      const options = [row[3], row[4], row[5], row[6]].filter(Boolean);
      
      let correctAnswerStr = (row[7] || '').toString().trim().toUpperCase();
      let correctAnswer = 0;
      if (correctAnswerStr === 'A') correctAnswer = 0;
      else if (correctAnswerStr === 'B') correctAnswer = 1;
      else if (correctAnswerStr === 'C') correctAnswer = 2;
      else if (correctAnswerStr === 'D') correctAnswer = 3;
      else if (!isNaN(parseInt(correctAnswerStr))) {
        // If it's a number like 1, 2, 3, 4
        correctAnswer = parseInt(correctAnswerStr) - 1;
      }

      const rationale = row[8] || '';

      if (options.length >= 2) {
        questions.push({ questionText, options, correctAnswer, rationale });
      }
    }

    if (questions.length > 0) {
      // Clear old questions
      await Question.deleteMany({});
      await Question.insertMany(questions);
      res.json({ message: `Successfully uploaded ${questions.length} questions` });
    } else {
      res.status(400).json({ message: 'No valid questions found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all questions
router.get('/questions', async (req, res) => {
  try {
    const q = await Question.find();
    res.json(q);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
