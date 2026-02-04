const express = require('express');
const router = express.Router();
const { getMe, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Захист усіх маршрутів

router.get('/me', getMe);
router.put('/profile', updateProfile);

module.exports = router;