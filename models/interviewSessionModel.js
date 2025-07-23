const mongoose = require('mongoose');

const questionResponseSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  questionType: { type: String, default: 'technical' },
  userResponse: { type: String },
  responseScore: { type: Number },
  aiFeedback: { type: String },
  questionOrder: { type: Number, required: true },
}, { _id: false, timestamps: true });


const interviewSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jobDescription: {
    type: String,
    required: true,
  },
  prepKit: { // Store the questions we generated in Step 3
      type: Object,
      required: true,
  },
  sessionStatus: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'abandoned'],
    default: 'pending',
  },
  questionsAndResponses: [questionResponseSchema],
  overallScore: { type: Number, default: 0 },
  completedAt: { type: Date },
}, { timestamps: true });

const InterviewSession = mongoose.model("InterviewSession", interviewSessionSchema);
module.exports = InterviewSession;