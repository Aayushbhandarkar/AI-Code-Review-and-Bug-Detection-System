const express = require('express');
const fileController = require('../controllers/file.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Protected routes (require authentication)
router.post('/upload-project', authMiddleware, fileController.uploadProject);
router.post('/analyze-code', authMiddleware, fileController.analyzeCode);

module.exports = router;