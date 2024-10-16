import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import './AdminDashboard.css';

function AdminDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [newQuestion, setNewQuestion] = useState({ 
    topic: '',
    question: '', 
    options: ['', '', '', ''], 
    correctAnswer: '' 
  });
  const [jsonInput, setJsonInput] = useState('');
  const [aiTopic, setAiTopic] = useState('');
  const [aiQuestionCount, setAiQuestionCount] = useState(1);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const history = useHistory();
  const { logout } = useAuth();
  const [tooltip, setTooltip] = useState({ message: '', type: '' });
  const [showTooltipFlag, setShowTooltipFlag] = useState(false);

  useEffect(() => {
    console.log('AdminDashboard mounted');
    fetchQuizzes();
  }, []);

  useEffect(() => {
    const homePage = document.getElementById('home-page');
    if (homePage) {
      homePage.style.display = 'none';
    }
    return () => {
      if (homePage) {
        homePage.style.display = 'block';
      }
    };
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('/api/quizzes');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched quizzes:', data.quizzes);
      setQuizzes(data.quizzes);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const handleLogout = () => {
    logout();
    history.push('/admin/login');
  };

  const handleEditQuestion = async (quizTitle, questionIndex, updatedQuestion) => {
    try {
      const response = await fetch('/api/edit-question', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizTitle, questionIndex, updatedQuestion }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchQuizzes();
      const updatedQuiz = quizzes.find(q => q.title === quizTitle);
      setSelectedQuiz(updatedQuiz);
      setIsAddingQuestion(false);
      setEditingQuestion(null);
      showTooltip('Question edited successfully');
    } catch (error) {
      console.error('Error editing question:', error);
      showTooltip('Failed to edit question', 'error');
    }
  };

  const handleDeleteQuestion = async (quizTitle, questionIndex) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        const response = await fetch('/api/delete-question', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quizTitle, questionIndex }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        await fetchQuizzes();
        const updatedQuiz = quizzes.find(q => q.title === quizTitle);
        setSelectedQuiz(updatedQuiz);
        showTooltip('Question deleted successfully');
      } catch (error) {
        console.error('Error deleting question:', error);
        showTooltip('Failed to delete question', 'error');
      }
    }
  };

  const handleAddQuestion = async (method) => {
    let questionData;
    let quizTitle;

    switch (method) {
      case 'manual':
        questionData = [{
          question: newQuestion.question,
          options: newQuestion.options,
          correctAnswer: newQuestion.correctAnswer
        }];
        quizTitle = selectedQuiz ? selectedQuiz.title : newQuestion.topic;
        break;
      case 'json':
        try {
          const parsedData = JSON.parse(jsonInput);
          if (!parsedData.title || !Array.isArray(parsedData.questions)) {
            throw new Error('Invalid JSON format');
          }
          questionData = parsedData.questions;
          quizTitle = parsedData.title;
        } catch (error) {
          alert('Invalid JSON format');
          return;
        }
        break;
      case 'ai':
        if (!aiTopic || aiQuestionCount < 1) {
          alert('Please enter a valid topic and number of questions');
          return;
        }
        try {
          const response = await fetch('/api/generate-questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: aiTopic, numberOfQuestions: aiQuestionCount }),
          });
          if (response.ok) {
            const data = await response.json();
            questionData = data.questions;
            quizTitle = aiTopic;
          } else {
            alert('Failed to generate questions');
            return;
          }
        } catch (error) {
          console.error('Error generating questions:', error);
          return;
        }
        break;
      default:
        return;
    }

    if (questionData && quizTitle) {
      try {
        const response = await fetch('/api/add-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quizTitle, questions: questionData }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        await fetchQuizzes();
        const updatedQuiz = quizzes.find(q => q.title === quizTitle);
        setSelectedQuiz(updatedQuiz);
        resetForm();
        showTooltip('Question(s) added successfully');
      } catch (error) {
        console.error('Error adding question(s):', error);
        showTooltip('Failed to add question(s)', 'error');
      }
    }
  };

  const resetForm = () => {
    setNewQuestion({ 
      topic: '',
      question: '', 
      options: ['', '', '', ''], 
      correctAnswer: '' 
    });
    setJsonInput('');
    setAiTopic('');
    setAiQuestionCount(1);
    setEditingQuestion(null);
  };

  const renderDashboard = () => (
    <div className="dashboard-overview">
      <h2>Dashboard Overview</h2>
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Quizzes</h3>
          <p>{quizzes.length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Questions</h3>
          <p>{quizzes.reduce((sum, quiz) => sum + quiz.questions.length, 0)}</p>
        </div>
      </div>
      <button className="primary-btn" onClick={() => {
        setActiveSection('questionHub');
        setIsAddingQuestion(false);
        resetForm();
      }}>
        Go to Question Hub
      </button>
      <button className="primary-btn" onClick={() => {
        setIsAddingQuestion(true);
        setEditingQuestion(null);
        resetForm();
      }}>
        Add Question
      </button>
    </div>
  );

  const renderQuestionHub = () => (
    <div className="question-hub">
      <h2>Question Hub</h2>
      <div className="quiz-list">
        {quizzes.map((quiz, index) => (
          <div key={index} className="quiz-card">
            <h3>{quiz.title}</h3>
            <p>{quiz.questions.length} questions</p>
            <button onClick={() => setSelectedQuiz(quiz)}>View Questions</button>
            <button onClick={() => handleDeleteQuiz(quiz.title)} className="delete-btn">Delete Quiz</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderQuizQuestions = () => (
    <div className="quiz-questions">
      <h2>{selectedQuiz.title}</h2>
      <button className="secondary-btn" onClick={() => setSelectedQuiz(null)}>
        Back to Question Hub
      </button>
      <button className="primary-btn" onClick={() => {
        setIsAddingQuestion(true);
        setEditingQuestion(null);
        resetForm();
      }}>
        Add New Question
      </button>
      <ul className="question-list">
        {selectedQuiz.questions.map((question, index) => (
          <li key={index} className="question-item">
            <h3>{question.question}</h3>
            <ul className="options-list">
              {question.options.map((option, optionIndex) => (
                <li key={optionIndex} className={option === question.correctAnswer ? 'correct-answer' : ''}>
                  {option}
                </li>
              ))}
            </ul>
            <div className="question-actions">
              <button className="edit-btn" onClick={() => startEditingQuestion(question, index)}>Edit</button>
              <button className="delete-btn" onClick={() => handleDeleteQuestion(selectedQuiz.title, index)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  const copyJsonPlaceholder = () => {
    navigator.clipboard.writeText(jsonPlaceholder).then(() => {
      alert('JSON placeholder copied to clipboard!');
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  const renderAddQuestion = () => (
    <div className="add-question-section">
      <h2>{editingQuestion ? 'Edit Question' : 'Add New Question'}</h2>
      <button className="secondary-btn" onClick={() => {
        setIsAddingQuestion(false);
        setEditingQuestion(null);
        resetForm();
      }}>
        Back to Questions
      </button>
      <div className="add-question-methods">
        <div className="method">
          <h4>Manual Entry</h4>
          <input
            type="text"
            placeholder="Topic"
            value={newQuestion.topic}
            onChange={(e) => setNewQuestion({ ...newQuestion, topic: e.target.value })}
          />
          <input
            type="text"
            placeholder="Question"
            value={newQuestion.question}
            onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
          />
          {newQuestion.options.map((option, index) => (
            <input
              key={index}
              type="text"
              placeholder={`Option ${index + 1}`}
              value={option}
              onChange={(e) => {
                const newOptions = [...newQuestion.options];
                newOptions[index] = e.target.value;
                setNewQuestion({ ...newQuestion, options: newOptions });
              }}
            />
          ))}
          <select
            value={newQuestion.correctAnswer}
            onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
          >
            <option value="">Select correct answer</option>
            {newQuestion.options.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
          <button onClick={() => {
            if (editingQuestion) {
              handleEditQuestion(selectedQuiz.title, editingQuestion.index, newQuestion);
            } else {
              handleAddQuestion('manual');
            }
          }}>
            {editingQuestion ? 'Update Question' : 'Add Question'}
          </button>
        </div>
        <div className="method">
          <h4>JSON Input</h4>
          <div className="json-input-container">
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={jsonPlaceholder}
            />
            <button className="copy-btn" onClick={copyJsonPlaceholder}>
              📋 {/* Unicode clipboard icon */}
            </button>
          </div>
          <button onClick={() => handleAddQuestion('json')}>Add from JSON</button>
        </div>
        <div className="method">
          <h4>AI Generation</h4>
          <input
            type="text"
            placeholder="Topic"
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
          />
          <input
            type="number"
            placeholder="Number of questions"
            value={aiQuestionCount}
            onChange={(e) => setAiQuestionCount(parseInt(e.target.value))}
            min="1"
            max="20"
          />
          <button onClick={() => handleAddQuestion('ai')}>Generate Questions</button>
        </div>
      </div>
    </div>
  );

  const jsonPlaceholder = `{
  "title": "General Knowledge",
  "questions": [
    {
      "question": "Who painted the Mona Lisa?",
      "options": [
        "Vincent van Gogh",
        "Leonardo da Vinci",
        "Pablo Picasso",
        "Michelangelo"
      ],
      "correctAnswer": "Leonardo da Vinci"
    },
    {
      "question": "Which programming language is this quiz app likely built with?",
      "options": [
        "Python",
        "Java",
        "JavaScript",
        "C++"
      ],
      "correctAnswer": "JavaScript"
    }
  ]
}`;

  const handleDeleteQuiz = async (quizTitle) => {
    if (window.confirm(`Are you sure you want to delete the "${quizTitle}" quiz?`)) {
      try {
        const response = await fetch('/api/delete-quiz', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quizTitle }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        await fetchQuizzes();
        setSelectedQuiz(null);
        setActiveSection('questionHub');
        showTooltip('Quiz deleted successfully');
      } catch (error) {
        console.error('Error deleting quiz:', error);
        showTooltip('Failed to delete quiz', 'error');
      }
    }
  };

  const handleDashboardClick = () => {
    setActiveSection('dashboard');
    setIsAddingQuestion(false);
    setSelectedQuiz(null);  // Add this line to collapse the category view
    resetForm();
  };

  const startEditingQuestion = (question, index) => {
    setEditingQuestion({ ...question, index });
    setNewQuestion({
      topic: selectedQuiz.title,
      question: question.question,
      options: [...question.options],
      correctAnswer: question.correctAnswer
    });
    setIsAddingQuestion(true);
  };

  const showTooltip = (message, type = 'success') => {
    setTooltip({ message, type });
    setShowTooltipFlag(true);
    setTimeout(() => setShowTooltipFlag(false), 3000);
  };

  return (
    <div className="admin-dashboard">
      <header>
        <h1>Admin Dashboard</h1>
        <nav>
          <button 
            className={`nav-btn ${activeSection === 'dashboard' ? 'active' : ''}`} 
            onClick={handleDashboardClick}  // Use the new function here
          >
            Dashboard
          </button>
          <button 
            className={`nav-btn ${activeSection === 'questionHub' ? 'active' : ''}`} 
            onClick={() => {
              setActiveSection('questionHub');
              setIsAddingQuestion(false);
              resetForm();
            }}
          >
            Question Hub
          </button>
          <button className="nav-btn" onClick={handleLogout}>Logout</button>
        </nav>
      </header>
      <main>
        {activeSection === 'dashboard' && renderDashboard()}
        {activeSection === 'questionHub' && !selectedQuiz && renderQuestionHub()}
        {selectedQuiz && !isAddingQuestion && renderQuizQuestions()}
        {isAddingQuestion && renderAddQuestion()}
      </main>
      {showTooltipFlag && (
        <div className={`tooltip ${tooltip.type}`}>
          {tooltip.message}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
