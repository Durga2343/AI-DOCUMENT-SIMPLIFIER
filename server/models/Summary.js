const mongoose = require('mongoose');

const RiskClauseSchema = new mongoose.Schema({
  clause: { type: String, required: true },
  explanation: { type: String, required: true },
  severity: { type: String, enum: ['High', 'Medium', 'Low'], required: true },
});

const FAQSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

const SummarySchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  simplifiedText: {
    type: String,
    required: true,
  },
  keyPoints: {
    type: [String],
    required: true,
  },
  faqs: {
    type: [FAQSchema],
    default: [],
  },
  riskClauses: {
    type: [RiskClauseSchema],
    default: [],
  },
  confidenceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  processingTimeMs: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Summary', SummarySchema);
