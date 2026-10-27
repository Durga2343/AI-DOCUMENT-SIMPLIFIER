const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Document = require('../models/Document');
const { generateWithFastFallback } = require('../config/gemini');

// Helper to get efficient context for fast inference
const getDocumentContext = (text) => {
  if (!text) return '';
  // Limiting context to 25,000 characters ensures ultra-low time-to-first-token while covering 10-15 pages
  return text.length > 25000 ? text.substring(0, 25000) + '\n...[Content truncated for performance]' : text;
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
    
    // Format history for Gemini API
    const formattedHistory = (history || [])
      .filter(msg => msg && msg.text && msg.text.trim())
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

    const result = await generateWithFastFallback({
      systemInstruction: `You are a concise, helpful AI assistant analyzing a document. Use the following document context to answer the user's questions directly. If the answer is not in the document, state that clearly. Keep responses concise, direct, and easy to understand (usually 2-4 sentences unless detailed explanation is requested).\n\nDocument Context:\n---\n${docContext}\n---`,
      chatHistory: formattedHistory,
      message,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 800,
      }
    });

    res.status(200).json({
      success: true,
      reply: result.text
    });

  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to process chat message.' });
  }
});

// @route   POST /api/assistant/translate/:documentId
// @desc    Translate document text to a target language
// @access  Protected
router.post('/translate/:documentId', protect, async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    
    if (!text || !targetLanguage) {
      return res.status(400).json({ success: false, message: 'Text and targetLanguage are required.' });
    }

    const prompt = `You are a professional translator. Translate the following text into ${targetLanguage}. Maintain the original formatting, meaning, and tone. Output ONLY the translated text without commentary, pleasantries, alternative versions, or markdown code fences.\n\nText to translate:\n---\n${text.substring(0, 30000)}\n---`;

    const result = await generateWithFastFallback({
      prompt,
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
      }
    });

    res.status(200).json({
      success: true,
      translatedText: result.text
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

    const prompt = `You are an expert who explains complex legal, contract, and technical jargon in plain, simple English. Explain the following clause in 2 to 4 concise sentences. Explain clearly what it means in simple terms and point out any key risks, responsibilities, or hidden conditions. Output ONLY the plain English explanation.\n\nClause to explain:\n---\n${highlightedText.substring(0, 10000)}\n---`;

    const result = await generateWithFastFallback({
      prompt,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 600,
      }
    });

    res.status(200).json({
      success: true,
      explanation: result.text
    });

  } catch (err) {
    console.error('Explain error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to explain text.' });
  }
});

module.exports = router;
