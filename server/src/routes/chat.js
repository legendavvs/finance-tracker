const express = require('express');
const router = express.Router();
const { getChatAdvice, parseTransaction} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');


router.post('/', protect, getChatAdvice);
router.post('/parse', protect, parseTransaction);

module.exports = router;