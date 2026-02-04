const db = require('../db');

// Додати транзакцію
const addTransaction = async (req, res) => {
  const { amount, type, category_id, date, description } = req.body;
  const userId = req.user.id;

  // Валідація
  if (!amount || !type || !date || !category_id) {
    return res.status(400).json({ error: 'Заповніть всі обов’язкові поля' });
  }

  try {
    const query = `
      INSERT INTO transactions (user_id, amount, type, category_id, date, description)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const values = [userId, amount, type, category_id, date, description || ''];
    const { rows } = await db.query(query, values);

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка при додаванні транзакції' });
  }
};

// Отримати список транзакцій (з фільтрами та пагінацією!)
const getTransactions = async (req, res) => {
  const userId = req.user.id;

  // Читаємо параметри з URL (наприклад: ?page=1&limit=10&type=expense)
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const type = req.query.type; // 'income' або 'expense' (опціонально)

  try {
    // Формуємо запит динамічно
    let queryText = `
      SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1
    `;

    const queryParams = [userId];

    // Якщо клієнт просить тільки витрати або тільки доходи
    if (type) {
      queryText += ` AND t.type = $2`;
      queryParams.push(type);
    }

    // Додаємо сортування та пагінацію
    queryText += ` ORDER BY t.date DESC, t.id DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const { rows } = await db.query(queryText, queryParams);

    // Також дізнаємось загальну кількість (для пагінації на фронті)
    const countQuery = `SELECT COUNT(*) FROM transactions WHERE user_id = $1 ${type ? "AND type = '" + type + "'" : ""}`;
    const countRes = await db.query(countQuery, [userId]);

    res.json({
      transactions: rows,
      totalPages: Math.ceil(countRes.rows[0].count / limit),
      currentPage: page
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка отримання транзакцій' });
  }
};

// Видалити транзакцію
const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const query = 'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING *';
    const { rows } = await db.query(query, [id, userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Транзакцію не знайдено або доступ заборонено' });
    }

    res.json({ message: 'Транзакцію видалено' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка видалення' });
  }
};

const getTransactionStats = async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Рахуємо загальну суму доходів
    const incomeRes = await db.query(
      "SELECT SUM(amount) FROM transactions WHERE user_id = $1 AND type = 'income'",
      [userId]
    );

    // 2. Рахуємо загальну суму витрат
    const expenseRes = await db.query(
      "SELECT SUM(amount) FROM transactions WHERE user_id = $1 AND type = 'expense'",
      [userId]
    );

    const income = Number(incomeRes.rows[0].sum) || 0;
    const expense = Number(expenseRes.rows[0].sum) || 0;
    const balance = income - expense;

    res.json({ income, expense, balance });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка підрахунку статистики' });
  }
};


const getCategoryStats = async (req, res) => {
  const userId = req.user.id;

  try {
    // SQL магія: Групуємо транзакції по категоріях і сумуємо їх
    const query = `
      SELECT c.name, SUM(t.amount) as value, c.color
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1 AND t.type = 'expense'
      GROUP BY c.name, c.color
      ORDER BY value DESC;
    `;

    const { rows } = await db.query(query, [userId]);

    // Перетворюємо 'value' з рядка в число (Postgres віддає DECIMAL як рядок)
    const formattedData = rows.map(item => ({
      name: item.name,
      value: Number(item.value),
      color: item.color || '#cccccc' // Запасний колір
    }));

    res.json(formattedData);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка отримання статистики категорій' });
  }
};

module.exports = { addTransaction, getTransactions, deleteTransaction, getTransactionStats, getCategoryStats };