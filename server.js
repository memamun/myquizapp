const express = require('express');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();
const helmet = require('helmet');

const app = express();

// Logging middleware
app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  next();
});

// Use helmet middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
  // Enable HSTS with a max-age of 1 year
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

app.use(express.json());

// Serve static files with caching headers
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1y',
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// If your React app is built in a 'build' folder, add this:
app.use(express.static(path.join(__dirname, 'build')));

const { addQuestionsToQuiz } = require('./src/generateQuestions');

app.post('/api/add-question', async (req, res) => {
  const { quizTitle, newQuestion } = req.body;

  try {
    const quizzesPath = path.join(__dirname, 'public', 'quizzes.json');
    const data = await fs.readFile(quizzesPath, 'utf8');
    const quizzes = JSON.parse(data).quizzes;
    
    const quizIndex = quizzes.findIndex(q => q.title === quizTitle);
    if (quizIndex === -1) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    quizzes[quizIndex].questions.push(newQuestion);
    
    await fs.writeFile(quizzesPath, JSON.stringify({ quizzes }, null, 2));
    res.json({ success: true, message: 'Question added successfully' });
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ success: false, message: 'Error adding question' });
  }
});

app.get('/quizzes.json', (req, res) => {
  const quizzesPath = path.join(__dirname, 'public', 'quizzes.json');
  fs.readFile(quizzesPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading quizzes.json:', err);
      return res.status(500).json({ error: 'Failed to read quizzes' });
    }
    res.json(JSON.parse(data));
  });
});

// Route to get quiz titles
app.get('/api/quiz-titles', async (req, res) => {
  try {
    const quizzesPath = path.join(__dirname, 'public', 'quizzes.json');
    const data = await fs.readFile(quizzesPath, 'utf8');
    const quizzes = JSON.parse(data).quizzes;
    const titles = quizzes.map(quiz => quiz.title);
    res.json({ titles });
  } catch (error) {
    console.error('Error reading quiz titles:', error);
    res.status(500).json({ error: 'Failed to read quiz titles' });
  }
});

// Route to get a specific quiz
app.get('/api/quiz/:title', async (req, res) => {
  try {
    const quizzesPath = path.join(__dirname, 'public', 'quizzes.json');
    const data = await fs.readFile(quizzesPath, 'utf8');
    const quizzes = JSON.parse(data).quizzes;
    const quiz = quizzes.find(q => q.title === req.params.title);
    if (quiz) {
      res.json(quiz);
    } else {
      res.status(404).json({ error: 'Quiz not found' });
    }
  } catch (error) {
    console.error('Error reading quiz:', error);
    res.status(500).json({ error: 'Failed to read quiz' });
  }
});

// Route to generate questions (update this to use async/await)
app.post('/api/generate-questions', async (req, res) => {
  const { topic, numberOfQuestions } = req.body;

  try {
    await addQuestionsToQuiz(topic, numberOfQuestions);
    res.json({ success: true, message: `Added ${numberOfQuestions} questions to the "${topic}" quiz.` });
  } catch (error) {
    console.error('Error in /api/generate-questions:', error);
    res.status(500).json({ success: false, message: 'Error generating questions: ' + error.message });
  }
});

// Other routes and server setup...

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Catch-all route handler
app.get('*', (req, res) => {
  console.log(`Serving React app for: ${req.url}`);
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Update the port to use an environment variable or default to 3001
const port = process.env.PORT || 3001;

// Update the listen method to use the PORT variable
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
