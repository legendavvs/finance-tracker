const express = require('express');
const router = express.Router();
const { getAllCategories, createCategory, deleteCategory } = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware'); // Імпортуємо охоронця

// Всі ці маршрути захищені (потрібен токен)
router.use(protect);

// GET /api/categories - Отримати список
router.get('/', getAllCategories);

// POST /api/categories - Створити нову
router.post('/', createCategory);

// DELETE /api/categories/:id - Видалити
router.delete('/:id', deleteCategory);

module.exports = router;