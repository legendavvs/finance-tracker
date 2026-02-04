const express = require('express');
const router = express.Router();
const {
    addTransaction,
    getTransactions,
    deleteTransaction,
    updateTransaction,
    getTransactionStats,   // <--- Перевір, чи є це
    getCategoryStats       // <--- Перевір, чи є це
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

// Всі маршрути захищені
router.use(protect);

// 1. Спочатку конкретні маршрути (статистика)
router.get('/stats', getTransactionStats);
router.get('/categories-stats', getCategoryStats);

// 2. Потім загальні (список і додавання)
router.post('/', addTransaction);
router.get('/', getTransactions);

// 3. І тільки в самому кінці - маршрути з параметрами (:id)
// Бо якщо поставити це вище, воно перехопить слово "stats" як id
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;