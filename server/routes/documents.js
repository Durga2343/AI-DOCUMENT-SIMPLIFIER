const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Document = require('../models/Document');
const { protect } = require('../middleware/auth');

// Setup multer memory storage (avoids physical file maintenance issues)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file limit
});

// @desc    Upload document and extract text
// @route   POST /api/documents/upload
// @access  Private
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const filename = req.file.originalname;
    const fileType = filename.split('.').pop().toLowerCase();
    let originalText = '';

    if (!['pdf', 'docx', 'txt'].includes(fileType)) {
      return res.status(400).json({ success: false, message: 'Only PDF, DOCX, and TXT files are allowed' });
    }

    // Process based on file format
    if (fileType === 'pdf') {
      const pdfData = await pdfParse(req.file.buffer);
      originalText = pdfData.text;
    } else if (fileType === 'docx') {
      const docxData = await mammoth.extractRawText({ buffer: req.file.buffer });
      originalText = docxData.value;
    } else if (fileType === 'txt') {
      originalText = req.file.buffer.toString('utf-8');
    }

    // Clean up empty lines and trailing spaces
    const cleanText = originalText.trim();

    if (!cleanText) {
      return res.status(400).json({ success: false, message: 'Could not extract text or file content is empty' });
    }

    // Save metadata and extracted text to MongoDB
    const document = await Document.create({
      userId: req.user.id,
      filename,
      originalText: cleanText,
      fileType,
    });

    res.status(201).json({
      success: true,
      message: 'File uploaded and parsed successfully',
      document: {
        _id: document._id,
        filename: document.filename,
        fileType: document.fileType,
        uploadedAt: document.uploadedAt,
      },
    });

  } catch (error) {
    console.error('File Upload/Extraction Error:', error);
    res.status(500).json({ success: false, message: 'Error processing file: ' + error.message });
  }
});

// @desc    Get all documents for the current user
// @route   GET /api/documents/my-documents
// @access  Private
router.get('/my-documents', protect, async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user.id })
      .select('-originalText') // Exclude heavy text field
      .sort({ uploadedAt: -1 });

    res.status(200).json({ success: true, documents });
  } catch (error) {
    console.error('Fetch documents error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// @desc    Delete a document and its analysis
// @route   DELETE /api/documents/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ success: false, message: 'Document not found.' });
    if (document.userId.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Access denied.' });

    await Document.findByIdAndDelete(req.params.id);

    // Also remove linked summary if it exists
    const Summary = require('../models/Summary');
    await Summary.deleteOne({ documentId: req.params.id });

    res.status(200).json({ success: true, message: 'Document deleted.' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// @desc    Get a single document by ID (metadata only, no originalText)
// @route   GET /api/documents/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).select('-originalText');
    if (!document) return res.status(404).json({ success: false, message: 'Document not found.' });
    if (document.userId.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Access denied.' });
    res.status(200).json({ success: true, document });
  } catch (error) {
    console.error('Fetch document error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;

