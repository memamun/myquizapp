let quizzes = [];
let currentQuiz = null;
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];
let timer = null;
const timePerQuestion = 30;

const homePage = document.getElementById('home-page');
const quizContainer = document.getElementById('quiz-container');
const resultPage = document.getElementById('result-page');
const answerSheet = document.getElementById('answer-sheet');

const testButtons = document.getElementById('test-buttons');
const quizTitle = document.getElementById('quiz-title');
const timerDisplay = document.getElementById('time-left');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const resultText = document.getElementById('result');
const scoreText = document.getElementById('score');
const finalScoreText = document.getElementById('final-score');

const answerSheetBtn = document.getElementById('answer-sheet-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const backHomeBtn = document.getElementById('back-home-btn');

// Fetch quizzes from JSON file
fetch('/quizzes.json')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    quizzes = data.quizzes;
    createTestButtons();
  })
  .catch(error => {
    console.error('Error loading quizzes:', error);
    alert('Failed to load quizzes. Please try refreshing the page.');
  });

function createTestButtons() {
  testButtons.innerHTML = ''; // Clear existing buttons
  quizzes.forEach((quiz, index) => {
    const button = document.createElement('button');
    button.textContent = quiz.title;
    button.addEventListener('click', () => startQuiz(index));
    testButtons.appendChild(button);
  });
}

function startQuiz(quizIndex) {
  currentQuiz = quizzes[quizIndex];
  currentQuestionIndex = 0;
  score = 0;
  userAnswers = [];
  
  homePage.style.display = 'none';
  quizContainer.style.display = 'block';
  quizTitle.textContent = currentQuiz.title;
  
  displayQuestion();
}

function displayQuestion() {
  if (currentQuestionIndex >= currentQuiz.questions.length) {
    finishQuiz();
    return;
  }

  const question = currentQuiz.questions[currentQuestionIndex];
  questionText.textContent = question.question;
  
  optionsContainer.innerHTML = '';
  question.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.textContent = option;
    button.addEventListener('click', () => selectOption(index));
    optionsContainer.appendChild(button);
  });

  startTimer();
}

function startTimer() {
  let timeLeft = timePerQuestion;
  timerDisplay.textContent = timeLeft;
  
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    
    if (timeLeft <= 0) {
      clearInterval(timer);
      selectOption(-1); // Time's up, move to next question
    }
  }, 1000);
}

function selectOption(index) {
  clearInterval(timer);
  
  const question = currentQuiz.questions[currentQuestionIndex];
  const selectedAnswer = index === -1 ? null : question.options[index];
  const correct = selectedAnswer === question.correctAnswer;

  userAnswers.push({
    question: question.question,
    options: question.options,
    userAnswer: selectedAnswer,
    correctAnswer: question.correctAnswer,
    correct: correct
  });

  if (correct) {
    score++;
  }

  currentQuestionIndex++;
  setTimeout(displayQuestion, 500);
}

function finishQuiz() {
  quizContainer.style.display = 'none';
  resultPage.style.display = 'block';
  finalScoreText.textContent = `Your score: ${score}/${currentQuiz.questions.length}`;
}

function showAnswerSheet() {
  resultPage.style.display = 'none';
  answerSheet.style.display = 'block';
  answerSheet.innerHTML = '';
  
  userAnswers.forEach((answer, index) => {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-review';
    questionDiv.innerHTML = `
      <h3>Question ${index + 1}: ${answer.question}</h3>
      ${answer.options.map(option => `
        <div class="option ${option === answer.userAnswer ? 'user-answer' : ''} ${option === answer.correctAnswer ? 'correct-answer' : ''} ${option !== answer.userAnswer && option !== answer.correctAnswer ? 'other-option' : ''}">
          ${option} ${option === answer.correctAnswer ? '✓' : ''}
        </div>
      `).join('')}
    `;
    answerSheet.appendChild(questionDiv);
  });
  
  const backButton = document.createElement('button');
  backButton.textContent = 'Back to Results';
  backButton.addEventListener('click', () => {
    answerSheet.style.display = 'none';
    resultPage.style.display = 'block';
  });
  answerSheet.appendChild(backButton);
}

function resetQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  userAnswers = [];
  resultPage.style.display = 'none';
  quizContainer.style.display = 'block';
  displayQuestion();
}

function backToHome() {
  resultPage.style.display = 'none';
  answerSheet.style.display = 'none';
  homePage.style.display = 'block';
}

answerSheetBtn.addEventListener('click', showAnswerSheet);
playAgainBtn.addEventListener('click', resetQuiz);
backHomeBtn.addEventListener('click', backToHome);

function checkForQuizUpdates() {
  fetch('/quizzes.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (JSON.stringify(quizzes) !== JSON.stringify(data.quizzes)) {
        quizzes = data.quizzes;
        createTestButtons();
      }
    })
    .catch(error => {
      console.error('Error checking for quiz updates:', error);
    });
}

// Check for updates every 30 seconds
setInterval(checkForQuizUpdates, 30000);
