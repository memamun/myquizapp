import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDashboard() {
  const [quizTitles, setQuizTitles] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: ''
  });
  const [aiTopic, setAiTopic] = useState('');
  const [aiQuestionCount, setAiQuestionCount] = useState(1);
  const history = useHistory();

  useEffect(() => {
    fetchQuizTitles();
    const hideHomePage = () => {
      const homePage = document.getElementById('homepageP') || document.getElementById('home-page');
      if (homePage) {
        homePage.style.display = 'none';
      }
    };

    hideHomePage();
    // Run the function again after a short delay to catch any dynamically added elements
    const timeoutId = setTimeout(hideHomePage, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  const fetchQuizTitles = async () => {
    try {
      const response = await fetch('/api/quiz-titles');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data.titles)) {
        setQuizTitles(data.titles);
      } else {
        throw new Error('Invalid data structure for quiz titles');
      }
    } catch (error) {
      console.error('Error fetching quiz titles:', error);
      // Don't use alert here, it might be causing issues
      console.log(`Failed to fetch quiz titles. Error: ${error.message}`);
    }
  };

  const handleQuizSelect = async (title) => {
    try {
      const response = await fetch(`/api/quiz/${encodeURIComponent(title)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const quiz = await response.json();
      setSelectedQuiz(quiz);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      alert(`Failed to fetch quiz. Error: ${error.message}`);
    }
  };

  const handleQuestionChange = (e) => {
    setNewQuestion({ ...newQuestion, question: e.target.value });
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  const handleCorrectAnswerChange = (e) => {
    setNewQuestion({ ...newQuestion, correctAnswer: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedQuiz || !newQuestion.question || newQuestion.options.some(option => !option) || !newQuestion.correctAnswer) {
      alert('Please fill in all fields');
      return;
    }
    
    try {
      const response = await fetch('/api/add-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizTitle: selectedQuiz.title,
          newQuestion: newQuestion
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add question');
      }

      const data = await response.json();
      if (data.success) {
        alert('Question added successfully!');
        setNewQuestion({
          question: '',
          options: ['', '', '', ''],
          correctAnswer: ''
        });
        await fetchQuizTitles(); // Refresh the quiz titles
        await handleQuizSelect(selectedQuiz.title); // Refresh the selected quiz
      } else {
        alert('Failed to add question: ' + data.message);
      }
    } catch (error) {
      console.error('Error adding question:', error);
      alert(`An error occurred while adding the question: ${error.message}`);
    }
  };

  const handleAiGenerate = async (e) => {
    e.preventDefault();
    if (!aiTopic || isNaN(aiQuestionCount) || aiQuestionCount < 1) {
      alert('Please enter a valid topic and number of questions');
      return;
    }

    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: aiTopic,
          numberOfQuestions: parseInt(aiQuestionCount, 10),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        setAiTopic('');
        setAiQuestionCount(1);
        await fetchQuizTitles(); // Refresh the quiz titles
      } else {
        alert('Failed to generate questions: ' + data.message);
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      alert(`An error occurred while generating questions: ${error.message}`);
    }
  };

  return (
    <div className="admin-dashboard">
      <header>
        <h1>Admin Dashboard</h1>
        <button className="logout-btn" onClick={() => {
          localStorage.removeItem('isAdminLoggedIn');
          history.push('/admin/login');
        }}>Logout</button>
      </header>

      {/* Existing form for adding questions manually */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="quiz-select">Select a quiz:</label>
          <select id="quiz-select" value={selectedQuiz ? selectedQuiz.title : ''} onChange={(e) => handleQuizSelect(e.target.value)}>
            <option value="">Select a quiz</option>
            {quizTitles.map((title) => (
              <option key={title} value={title}>{title}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="question-input">Question:</label>
          <input
            id="question-input"
            type="text"
            value={newQuestion.question}
            onChange={handleQuestionChange}
            placeholder="Enter question"
          />
        </div>
        {newQuestion.options.map((option, index) => (
          <div key={index} className="form-group">
            <label htmlFor={`option-${index + 1}`}>Option {index + 1}:</label>
            <input
              id={`option-${index + 1}`}
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
            />
          </div>
        ))}
        <div className="form-group">
          <label htmlFor="correct-answer">Correct answer:</label>
          <input
            id="correct-answer"
            type="text"
            value={newQuestion.correctAnswer}
            onChange={handleCorrectAnswerChange}
            placeholder="Correct answer"
          />
        </div>
        <button type="submit" className="submit-btn">Add Question</button>
      </form>

      {/* New form for AI-generated questions */}
      <form onSubmit={handleAiGenerate}>
        <h2>Generate Questions with AI</h2>
        <div className="form-group">
          <label htmlFor="ai-topic">Topic:</label>
          <input
            id="ai-topic"
            type="text"
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            placeholder="Enter topic for AI-generated questions"
          />
        </div>
        <div className="form-group">
          <label htmlFor="ai-question-count">Number of questions:</label>
          <input
            id="ai-question-count"
            type="number"
            value={aiQuestionCount}
            onChange={(e) => setAiQuestionCount(e.target.value === '' ? '' : Number(e.target.value))}
            min="1"
            max="20"
          />
        </div>
        <button type="submit" className="submit-btn">Generate Questions with AI</button>
      </form>
    </div>
  );
}

export default AdminDashboard;
