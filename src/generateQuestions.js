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
  const quizzesData = JSON.parse(fs.readFileSync(quizzesPath, 'utf8'));

  const newQuestions = await generateQuestions(topic, numberOfQuestions);

  // Check if a quiz with the given topic already exists
  let quiz = quizzesData.quizzes.find(q => q.title.toLowerCase() === topic.toLowerCase());

  if (quiz) {
    // Add new questions to the existing quiz
    quiz.questions = [...quiz.questions, ...newQuestions];
  } else {
    // Create a new quiz with the generated questions
    quiz = {
      title: topic,
      questions: newQuestions
    };
    quizzesData.quizzes.push(quiz);
  }

  // Write the updated data back to the file
  fs.writeFileSync(quizzesPath, JSON.stringify(quizzesData, null, 2));
  console.log(`Added ${newQuestions.length} questions to the "${topic}" quiz.`);
}

module.exports = { addQuestionsToQuiz };
