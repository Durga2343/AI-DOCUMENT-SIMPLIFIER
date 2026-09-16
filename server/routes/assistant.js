const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { protect } = require('../middleware/auth');
const Document = require('../models/Document');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Helper to chunk text if needed for prompt limits
const getDocumentContext = (text) => {
  // If the document is extremely large, we might want to trim it to fit in context window.
  // Gemini 1.5 Flash has a very large context window (1M+ tokens), so we can pass most documents directly.
  // We'll limit to first 100,000 characters just to be safe on payload size, though usually it handles more.
  return text.substring(0, 100000);
};

// @route   POST /api/assistant/chat/:documentId
// @desc    Chat with the document context
// @access  Protected
router.post('/chat/:documentId', protect, async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const document = await Document.findById(req.params.documentId);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    if (document.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const docContext = getDocumentContext(document.originalText);
    
    // Format history for Gemini
    const formattedHistory = (history || []).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Start chat session
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-flash-latest',
      systemInstruction: `You are a helpful AI assistant analyzing a document. Use the following document context to answer the user's questions. If the answer is not in the document, say so. Keep answers concise and helpful.\n\nDocument Context:\n---\n${docContext}\n---`
    });

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({
      success: true,
      reply: text
    });

  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to process chat message.' });
  }
});

// @route   POST /api/assistant/translate/:documentId
// @desc    Translate document summary to a target language
// @access  Protected
router.post('/translate/:documentId', protect, async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    
    if (!text || !targetLanguage) {
      return res.status(400).json({ success: false, message: 'Text and targetLanguage are required.' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    const prompt = `You are a professional translator. Translate the following text into ${targetLanguage}. Maintain the original tone and formatting.\n\nText to translate:\n---\n${text}\n---`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text().trim();

    res.status(200).json({
      success: true,
      translatedText
    });

  } catch (err) {
    console.error('Translation error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to translate text.' });
  }
});

// @route   POST /api/assistant/explain/:documentId
// @desc    Explain a specific highlighted clause or text
// @access  Protected
router.post('/explain/:documentId', protect, async (req, res) => {
  try {
    const { highlightedText } = req.body;
    
    if (!highlightedText) {
      return res.status(400).json({ success: false, message: 'highlightedText is required.' });
    }

    const document = await Document.findById(req.params.documentId);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    if (document.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Pass the highlighted text and a snippet of the document for context if needed, 
    // but the highlighted text itself is usually enough for a plain English explanation.
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    const prompt = `You are a legal and technical expert. A user has highlighted a complex clause from their document. Explain this specific clause in plain, simple English (like explaining to a 10-year-old). Also mention any potential risks or important implications of this clause.\n\nHighlighted Clause:\n---\n${highlightedText}\n---`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const explanation = response.text().trim();

    res.status(200).json({
      success: true,
      explanation
    });

  } catch (err) {
    console.error('Explain error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to explain text.' });
  }
});

module.exports = router;
