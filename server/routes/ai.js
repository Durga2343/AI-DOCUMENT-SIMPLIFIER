const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { protect } = require('../middleware/auth');
const Document = require('../models/Document');
const Summary = require('../models/Summary');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Chunk text into pieces under 28,000 chars for safe Gemini token limits
const chunkText = (text, maxChunkSize = 28000) => {
  if (text.length <= maxChunkSize) return [text];
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    let end = start + maxChunkSize;
    // Try to break at a paragraph or sentence boundary
    if (end < text.length) {
      const breakPoint = text.lastIndexOf('\n\n', end);
      if (breakPoint > start) end = breakPoint;
      else {
        const sentenceBreak = text.lastIndexOf('. ', end);
        if (sentenceBreak > start) end = sentenceBreak + 1;
      }
    }
    chunks.push(text.slice(start, end).trim());
    start = end;
  }
  return chunks;
};

// Build prompt for a single chunk or full document
const buildPrompt = (text, isChunk = false, chunkIndex = 1, totalChunks = 1) => {
  const chunkContext = isChunk
    ? `This is chunk ${chunkIndex} of ${totalChunks} from a larger document. Analyze this section.\n\n`
    : '';

  return `${chunkContext}You are an expert legal and technical document analyst. Analyze the following document text and return a structured JSON response.

IMPORTANT: Return ONLY a valid JSON object — no markdown, no code fences, no explanation.

Required JSON structure:
{
  "summary": "A concise 3-5 sentence executive summary of the document",
  "simplifiedText": "The full document rewritten in plain English that a 10-year-old could understand. Use simple words and short sentences.",
  "keyPoints": ["Point 1", "Point 2", "Point 3", "...up to 8 key points"],
  "faqs": [
    {"question": "Frequently asked question", "answer": "Clear answer"},
    "...2 to 5 FAQ pairs"
  ],
  "riskClauses": [
    {"clause": "Exact or paraphrased risky clause text", "explanation": "Why this is risky", "severity": "High|Medium|Low"},
    "...0 to 5 risk clauses if applicable, otherwise empty array"
  ],
  "confidenceScore": 85
}

Document Text:
---
${text}
---

Return only the JSON object:`;
};

// Merge multiple chunk summaries into a final consolidated summary
const buildMergePrompt = (chunkSummaries) => {
  const summariesText = chunkSummaries
    .map((s, i) => `--- Chunk ${i + 1} Analysis ---\n${JSON.stringify(s, null, 2)}`)
    .join('\n\n');

  return `You are a document analyst. Below are separate JSON analyses of different chunks of one large document.
Merge them into a single, unified, complete JSON analysis. Deduplicate key points, faqs, and risk clauses.

IMPORTANT: Return ONLY a valid JSON object — no markdown, no code fences, no explanation.

Required JSON structure:
{
  "summary": "Unified executive summary",
  "simplifiedText": "Merged simplified text of the entire document",
  "keyPoints": ["Deduplicated key points array"],
  "faqs": [{"question": "...", "answer": "..."}],
  "riskClauses": [{"clause": "...", "explanation": "...", "severity": "High|Medium|Low"}],
  "confidenceScore": 85
}

Chunk analyses:
${summariesText}

Return only the merged JSON object:`;
};

// Call Gemini and parse the JSON response
const callGemini = async (prompt) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in the server environment.');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
  const result = await model.generateContent(prompt);
  const responseText = result.response.text().trim();

  // Strip markdown code fences if the model returns them despite instructions
  const cleaned = responseText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (parseError) {
    console.error('Gemini JSON parse error. Raw response:', cleaned);
    throw new Error('AI returned a non-JSON response. Please try again.');
  }
};

// @route   POST /api/ai/process/:documentId
// @desc    Process document text with Gemini AI
// @access  Protected
router.post('/process/:documentId', protect, async (req, res) => {
  const startTime = Date.now();

  try {
    const document = await Document.findById(req.params.documentId);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    // Ensure the document belongs to the requesting user
    if (document.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Return existing summary to avoid duplicate API charges
    const existingSummary = await Summary.findOne({ documentId: document._id });
    if (existingSummary) {
      return res.status(200).json({
        success: true,
        cached: true,
        message: 'Returning previously generated analysis.',
        summary: existingSummary,
      });
    }

    const text = document.originalText;
    let analysisResult;

    if (text.length <= 30000) {
      // Single-pass processing
      const prompt = buildPrompt(text);
      analysisResult = await callGemini(prompt);
    } else {
      // Multi-chunk processing
      const chunks = chunkText(text);
      console.log(`Document is large. Splitting into ${chunks.length} chunks.`);

      const chunkResults = [];
      for (let i = 0; i < chunks.length; i++) {
        const prompt = buildPrompt(chunks[i], true, i + 1, chunks.length);
        const chunkResult = await callGemini(prompt);
        chunkResults.push(chunkResult);
      }

      // Merge all chunk results
      const mergePrompt = buildMergePrompt(chunkResults);
      analysisResult = await callGemini(mergePrompt);
    }

    // Validate and sanitize the AI result
    const summary = new Summary({
      documentId: document._id,
      userId: req.user.id,
      summary: analysisResult.summary || '',
      simplifiedText: analysisResult.simplifiedText || '',
      keyPoints: Array.isArray(analysisResult.keyPoints) ? analysisResult.keyPoints : [],
      faqs: Array.isArray(analysisResult.faqs) ? analysisResult.faqs : [],
      riskClauses: Array.isArray(analysisResult.riskClauses) ? analysisResult.riskClauses : [],
      confidenceScore: typeof analysisResult.confidenceScore === 'number'
        ? Math.min(100, Math.max(0, analysisResult.confidenceScore))
        : 80,
      processingTimeMs: Date.now() - startTime,
    });

    await summary.save();

    res.status(201).json({
      success: true,
      cached: false,
      message: 'Document processed successfully.',
      summary,
    });

  } catch (err) {
    console.error('AI Processing error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error during AI processing.',
    });
  }
});

// @route   GET /api/ai/result/:documentId
// @desc    Get existing AI analysis for a document
// @access  Protected
router.get('/result/:documentId', protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.documentId);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    if (document.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const summary = await Summary.findOne({ documentId: document._id });

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'No AI analysis found. Please process the document first.',
      });
    }

    res.status(200).json({ success: true, summary });

  } catch (err) {
    console.error('Get result error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// @route   GET /api/ai/my-analyses
// @desc    Get all AI analyses for the current user
// @access  Protected
router.get('/my-analyses', protect, async (req, res) => {
  try {
    const summaries = await Summary.find({ userId: req.user.id })
      .populate('documentId', 'filename fileType uploadedAt')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, summaries });

  } catch (err) {
    console.error('Get analyses error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
