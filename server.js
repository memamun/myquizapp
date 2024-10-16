require('dotenv').config();
const express = require('express');
const path = require('path');
const { addQuestionsToQuiz } = require('./src/generateQuestions');
const fs = require('fs');

const app = express();
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Helper function to read and write quizzes data
const getQuizzesData = () => {
  const quizzesPath = path.join(__dirname, 'public', 'quizzes.json');
  return JSON.parse(fs.readFileSync(quizzesPath, 'utf8'));
};

const saveQuizzesData = (data) => {
  const quizzesPath = path.join(__dirname, 'public', 'quizzes.json');
  fs.writeFileSync(quizzesPath, JSON.stringify(data, null, 2));
};

// Get all quizzes
app.get('/api/quizzes', (req, res) => {
  try {
    const quizzesData = getQuizzesData();
    res.json(quizzesData);
  } catch (error) {
    console.error('Error reading quizzes:', error);
    res.status(500).json({ success: false, message: 'Error reading quizzes' });
  }
});

// Add questions to a quiz
app.post('/api/add-questions', async (req, res) => {
  const { quizTitle, questions } = req.body;
  try {
    let quizzesData = getQuizzesData();
    const quizIndex = quizzesData.quizzes.findIndex(q => q.title === quizTitle);
    
    if (quizIndex === -1) {
      // Create a new quiz if it doesn't exist
      quizzesData.quizzes.push({ title: quizTitle, questions: questions });
    } else {
      // Add questions to existing quiz
      quizzesData.quizzes[quizIndex].questions.push(...questions);
    }
    
    saveQuizzesData(quizzesData);
    res.json({ success: true, message: 'Questions added successfully' });
  } catch (error) {
    console.error('Error adding questions:', error);
    res.status(500).json({ success: false, message: 'Error adding questions' });
  }
});

// Edit a question
app.put('/api/edit-question', async (req, res) => {
  const { quizTitle, questionIndex, updatedQuestion } = req.body;
  try {
    let quizzesData = getQuizzesData();
    const quizIndex = quizzesData.quizzes.findIndex(q => q.title === quizTitle);
    
    if (quizIndex === -1) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    
    quizzesData.quizzes[quizIndex].questions[questionIndex] = updatedQuestion;
    saveQuizzesData(quizzesData);
    res.json({ success: true, message: 'Question edited successfully' });
  } catch (error) {
    console.error('Error editing question:', error);
    res.status(500).json({ success: false, message: 'Error editing question' });
  }
});

// Delete a question
app.delete('/api/delete-question', async (req, res) => {
  const { quizTitle, questionIndex } = req.body;
  try {
    let quizzesData = getQuizzesData();
    const quizIndex = quizzesData.quizzes.findIndex(q => q.title === quizTitle);
    
    if (quizIndex === -1) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    
    quizzesData.quizzes[quizIndex].questions.splice(questionIndex, 1);
    saveQuizzesData(quizzesData);
    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ success: false, message: 'Error deleting question' });
  }
});

// Delete a quiz
app.delete('/api/delete-quiz', async (req, res) => {
  console.log('Received delete quiz request');
  const { quizTitle } = req.body;
  console.log('Quiz to delete:', quizTitle);
  try {
    let quizzesData = getQuizzesData();
    quizzesData.quizzes = quizzesData.quizzes.filter(quiz => quiz.title !== quizTitle);
    saveQuizzesData(quizzesData);
    res.json({ success: true, message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ success: false, message: 'Error deleting quiz' });
  }
});

// Generate questions using AI
app.post('/api/generate-questions', async (req, res) => {
  const { topic, numberOfQuestions } = req.body;
  try {
    const questions = await addQuestionsToQuiz(topic, numberOfQuestions);
    res.json({ success: true, message: `Added ${numberOfQuestions} questions to the "${topic}" quiz.`, questions });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ success: false, message: 'Error generating questions' });
  }
});

// Get all quizzes for the question hub
app.get('/api/quizhub', (req, res) => {
  try {
    const quizzesData = getQuizzesData();
    res.json({ success: true, quizzes: quizzesData.quizzes.map(q => ({ title: q.title, questionCount: q.questions.length })) });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ success: false, message: 'Error fetching quizzes' });
  }
});

// Get a specific quiz
app.get('/api/quiz/:quizTitle', (req, res) => {
  try {
    const quizzesData = getQuizzesData();
    const quiz = quizzesData.quizzes.find(q => q.title === req.params.quizTitle);
    if (quiz) {
      res.json({ success: true, quiz });
    } else {
      res.status(404).json({ success: false, message: 'Quiz not found' });
    }
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ success: false, message: 'Error fetching quiz' });
  }
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
