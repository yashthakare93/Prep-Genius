const InterviewSession = require('../models/interviewSessionModel');
const { callGemini } = require('../services/geminiService');

module.exports = (socket, io) => {
  let currentSessionId;
  let questions = [];
  let currentQuestionIndex = 0;

  // --- 1. Client starts the interview ---
  socket.on('startInterview', async ({ sessionId }) => {
    try {
      currentSessionId = sessionId;
      const session = await InterviewSession.findById(sessionId);
      if (!session) {
        return socket.emit('error', { message: 'Interview session not found.' });
      }

      // Load questions from the prep kit we stored
      questions = [...session.prepKit.technicalQuestions, ...session.prepKit.behavioralQuestions];
      session.sessionStatus = 'in_progress';
      await session.save();

      console.log(`Interview started for session: ${sessionId}`);
      socket.emit('interviewStarted', { totalQuestions: questions.length });
      
      // Ask the first question
      socket.emit('nextQuestion', { question: questions[0], questionNumber: 1 });

    } catch (error) {
      socket.emit('error', { message: 'Failed to start interview.' });
    }
  });

  // --- 2. Client submits an answer ---
  socket.on('submitAnswer', async ({ answer }) => {
    if (!currentSessionId || !questions.length) return;

    try {
      const currentQuestion = questions[currentQuestionIndex];

      const prompt = `
        As an expert interviewer, analyze this candidate's response.
        Provide a response in JSON format with two keys: "score" and "feedback".
        - "score": A number from 0 to 10 for the response quality.
        - "feedback": A short, constructive critique (2-3 sentences).

        Here is the data:
        [QUESTION]: "${currentQuestion}"
        [CANDIDATE'S ANSWER]: "${answer}"
      `;

      const geminiResponse = await callGemini(prompt);
      const analysis = JSON.parse(geminiResponse.replace(/```json/g, '').replace(/```/g, '').trim());

      // Send immediate feedback to the user
      socket.emit('answerFeedback', {
        feedback: analysis.feedback,
        score: analysis.score,
      });

      // Save the complete interaction to the database
      await InterviewSession.findByIdAndUpdate(currentSessionId, {
        $push: {
          questionsAndResponses: {
            questionText: currentQuestion,
            userResponse: answer,
            responseScore: analysis.score,
            aiFeedback: analysis.feedback,
            questionOrder: currentQuestionIndex + 1,
          },
        },
      });

      currentQuestionIndex++;

      // --- 3. Decide what to do next ---
      if (currentQuestionIndex < questions.length) {
        // Ask the next question after a short delay
        setTimeout(() => {
          socket.emit('nextQuestion', {
            question: questions[currentQuestionIndex],
            questionNumber: currentQuestionIndex + 1,
          });
        }, 3000); // 3-second delay
      } else {
        // End the interview
        const finalSession = await InterviewSession.findById(currentSessionId);
        finalSession.sessionStatus = 'completed';
        finalSession.completedAt = new Date();
        // Simple overall score calculation
        const totalScore = finalSession.questionsAndResponses.reduce((sum, qa) => sum + qa.responseScore, 0);
        finalSession.overallScore = (totalScore / questions.length) * 10; // Scale to 100
        await finalSession.save();

        socket.emit('interviewCompleted', {
          message: 'Interview completed!',
          reportId: currentSessionId,
        });
      }
    } catch (error) {
      console.error(error);
      socket.emit('error', { message: 'An error occurred while processing your answer.' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Here you could add logic to mark the session as 'abandoned' if it was in progress
  });
};