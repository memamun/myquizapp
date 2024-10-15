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

  useEffect(() => {
    console.log('AdminDashboard mounted');
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('/quizzes.json');
      const data = await response.json();
      setQuizzes(data.quizzes);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const handleLogout = () => {
    logout();
    history.push('/admin/login');
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setNewQuestion(question);
    setIsAddingQuestion(true);
  };

  const handleDeleteQuestion = async (quizTitle, questionIndex) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        const response = await fetch('/api/delete-question', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quizTitle, questionIndex }),
        });
        if (response.ok) {
          await fetchQuizzes();
          const updatedQuiz = quizzes.find(q => q.title === quizTitle);
          setSelectedQuiz(updatedQuiz);
        } else {
          alert('Failed to delete question');
        }
      } catch (error) {
        console.error('Error deleting question:', error);
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
            body: JSON.stringify({ topic: aiTopic, count: aiQuestionCount }),
          });
          if (response.ok) {
            const data = await response.json();
            questionData = data.questions;
          } else {
            alert('Failed to generate questions');
            return;
          }
        } catch (error) {
          console.error('Error generating questions:', error);
          return;
        }
        quizTitle = selectedQuiz ? selectedQuiz.title : aiTopic;
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

        if (response.ok) {
          // Refresh the quizzes list
          fetchQuizzes();
          // Clear the input fields
          setJsonInput('');
          setNewQuestion({ question: '', options: ['', '', '', ''], correctAnswer: '' });
          setAiTopic('');
          setAiQuestionCount(1);
          alert('Questions added successfully!');
        } else {
          const errorData = await response.json();
          alert(`Failed to add questions: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Error adding questions:', error);
        alert('An error occurred while adding questions');
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
      <button className="primary-btn" onClick={() => setActiveSection('questionHub')}>
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
          <div key={index} className="quiz-card" onClick={() => setSelectedQuiz(quiz)}>
            <h3>{quiz.title}</h3>
            <p>{quiz.questions.length} questions</p>
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
              <button className="edit-btn" onClick={() => handleEditQuestion(question)}>Edit</button>
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
      }}>
        Back to Dashboard
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
          <button onClick={() => handleAddQuestion('manual')}>
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
            max="10"
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

  return (
    <div className="admin-dashboard">
      <header>
        <h1>Admin Dashboard</h1>
        <nav>
          <button className={`nav-btn ${activeSection === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveSection('dashboard')}>Dashboard</button>
          <button className={`nav-btn ${activeSection === 'questionHub' ? 'active' : ''}`} onClick={() => setActiveSection('questionHub')}>Question Hub</button>
          <button className="nav-btn" onClick={handleLogout}>Logout</button>
        </nav>
      </header>
      <main>
        {activeSection === 'dashboard' && renderDashboard()}
        {activeSection === 'questionHub' && !selectedQuiz && renderQuestionHub()}
        {selectedQuiz && !isAddingQuestion && renderQuizQuestions()}
        {isAddingQuestion && renderAddQuestion()}
      </main>
    </div>
  );
}

export default AdminDashboard;
