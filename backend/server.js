const express = require('express');
const path = require('path');
const { addQuestionsToQuiz } = require('../src/generateQuestions');

const app = express();
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '..', 'build')));

// ... (keep existing routes)

app.post('/api/generate-questions', async (req, res) => {
  const { topic, numberOfQuestions } = req.body;

  try {
    await addQuestionsToQuiz(topic, numberOfQuestions);
    res.json({ success: true, message: `Added ${numberOfQuestions} questions to the "${topic}" quiz.` });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ success: false, message: 'Error generating questions' });
  }
});

// ... (keep existing routes)

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
