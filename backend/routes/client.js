const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Question = require('../models/Question');
const Score = require('../models/Score');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware(['client']));

// Get assigned test
router.get('/test', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user.assignedQuestions || user.assignedQuestions <= 0) {
      return res.status(400).json({ message: 'No test assigned to you currently.' });
    }

    // Get all questions
    const allQuestions = await Question.find();
    if (allQuestions.length === 0) {
      return res.status(400).json({ message: 'No questions available in the bank.' });
    }

    // Shuffle and pick
    const numQuestions = Math.min(user.assignedQuestions, allQuestions.length);
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, numQuestions);

    // Remove correct answers from payload sent to client (prevent cheating)
    // Actually, client needs answers if they are checking rationale.
    // Or we send back correct answers only on submit? The requirement doesn't say client needs to review the right answers.
    // The original HTML does have rationale and correct answer checking at the end. So we should probably send it, or calculate on backend and return the result.
    // Let's keep it secure: send questions without answers, client submits their answers, backend scores and returns correct answers with rationale.
    const secureQuestions = selected.map(q => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options
    }));

    res.json({ questions: secureQuestions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit test
router.post('/submit', async (req, res) => {
  try {
    const { answers } = req.body; // { questionId: selectedOptionIndex }
    
    let score = 0;
    const results = []; // To send back for review
    let totalQuestions = 0;

    for (const qId in answers) {
      const q = await Question.findById(qId);
      if (q) {
        totalQuestions++;
        const isCorrect = parseInt(answers[qId]) === q.correctAnswer;
        if (isCorrect) score++;
        
        results.push({
          _id: q._id,
          questionText: q.questionText,
          options: q.options,
          userAnswer: parseInt(answers[qId]),
          correctAnswer: q.correctAnswer,
          isCorrect,
          rationale: q.rationale
        });
      }
    }

    // Save score
    const newScore = new Score({
      userId: req.user.userId,
      score,
      totalQuestions
    });
    await newScore.save();

    // Reset assigned questions
    await User.findByIdAndUpdate(req.user.userId, { assignedQuestions: 0 });

    res.json({ score, totalQuestions, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get my scores
router.get('/my-scores', async (req, res) => {
  try {
    const scores = await Score.find({ userId: req.user.userId }).sort({ date: -1 });
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
