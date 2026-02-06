const express = require('express');
const router = express.Router();
const { getChatAdvice } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, getChatAdvice);

module.exports = router;