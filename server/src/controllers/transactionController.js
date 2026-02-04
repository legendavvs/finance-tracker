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
// Отримати список транзакцій (з фільтрами)
const getTransactions = async (req, res) => {
  const userId = req.user.id;
  
  // Отримуємо параметри з адреси запиту
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;
  
  const { search, month, year, type } = req.query; // <--- НОВІ ПАРАМЕТРИ

  try {
    // Початковий запит
    let queryText = `
      SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1
    `;
    
    // Масив значень для SQL ($1, $2...)
    const queryParams = [userId];
    let paramCount = 1;

    // 1. Фільтр по типу (витрата/дохід)
    if (type) {
      paramCount++;
      queryText += ` AND t.type = $${paramCount}`;
      queryParams.push(type);
    }

    // 2. Пошук по опису (ILIKE = ігнорує регістр)
    if (search) {
      paramCount++;
      queryText += ` AND t.description ILIKE $${paramCount}`;
      queryParams.push(`%${search}%`); // Додаємо % для пошуку часткового співпадіння
    }

    // 3. Фільтр по місяцю і року
    if (month && year) {
      // Postgres функція EXTRACT витягує частину дати
      paramCount++;
      queryText += ` AND EXTRACT(MONTH FROM t.date) = $${paramCount}`;
      queryParams.push(month);
      
      paramCount++;
      queryText += ` AND EXTRACT(YEAR FROM t.date) = $${paramCount}`;
      queryParams.push(year);
    }

    // Сортування і пагінація
    queryText += ` ORDER BY t.date DESC, t.id DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const { rows } = await db.query(queryText, queryParams);
    
    res.json({ transactions: rows });
  } catch (err) {
    console.error("Error getting transactions:", err);
    res.status(500).json({ error: 'Помилка отримання транзакцій' });
  }
};

const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { amount, type, category_id, date, description } = req.body;
  const userId = req.user.id;

  try {
    // Перевіряємо, чи належить транзакція цьому користувачу
    const checkQuery = 'SELECT * FROM transactions WHERE id = $1 AND user_id = $2';
    const checkRes = await db.query(checkQuery, [id, userId]);

    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'Транзакцію не знайдено' });
    }

    // Оновлюємо
    const updateQuery = `
      UPDATE transactions 
      SET amount = $1, type = $2, category_id = $3, date = $4, description = $5
      WHERE id = $6 AND user_id = $7
      RETURNING *;
    `;

    const values = [amount, type, category_id, date, description || '', id, userId];
    const { rows } = await db.query(updateQuery, values);

    res.json(rows[0]);
  } catch (err) {
    console.error("Error updating transaction:", err);
    res.status(500).json({ error: 'Помилка оновлення' });
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

module.exports = { addTransaction, getTransactions, deleteTransaction,updateTransaction, getTransactionStats, getCategoryStats, };