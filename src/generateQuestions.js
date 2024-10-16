const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function generateQuestions(topic, numberOfQuestions) {
  const prompt = `Generate ${numberOfQuestions} multiple-choice questions about ${topic}. Each question should have 4 options and one correct answer.Format the output as a JSON array of objects, where each object has the following structure:
  {
    "question": "The question text",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correctAnswer": "The correct option"
  }
  `

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    console.log('AI response:', responseText);

    // Extract JSON from the response
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      const jsonContent = jsonMatch[1].trim();
      const generatedQuestions = JSON.parse(jsonContent);
      
      // Ensure we return only the requested number of questions
      return generatedQuestions.slice(0, numberOfQuestions);
    } else {
      throw new Error('Unable to extract valid JSON from the AI response');
    }
  } catch (error) {
    console.error("Error generating questions:", error);
    return [];
  }
}

async function addQuestionsToQuiz(topic, numberOfQuestions) {
  const quizzesPath = path.join(__dirname, '..', 'public', 'quizzes.json');
  let quizzesData;
  
  try {
    quizzesData = JSON.parse(fs.readFileSync(quizzesPath, 'utf8'));
  } catch (error) {
    console.error('Error reading quizzes file:', error);
    throw new Error('Failed to read quizzes file');
  }

  const newQuestions = await generateQuestions(topic, numberOfQuestions);

  let quiz = quizzesData.quizzes.find(q => q.title.toLowerCase() === topic.toLowerCase());

  if (quiz) {
    quiz.questions = [...quiz.questions, ...newQuestions];
  } else {
    quiz = {
      title: topic,
      questions: newQuestions
    };
    quizzesData.quizzes.push(quiz);
  }

  try {
    fs.writeFileSync(quizzesPath, JSON.stringify(quizzesData, null, 2));
    console.log(`Added ${newQuestions.length} questions to the "${topic}" quiz.`);
    return newQuestions;
  } catch (error) {
    console.error('Error writing quizzes file:', error);
    throw new Error('Failed to write quizzes file');
  }
}

module.exports = { addQuestionsToQuiz };
