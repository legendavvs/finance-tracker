const db = require('../db');

// Отримати всі категорії (Системні + Особисті)
const getAllCategories = async (req, res) => {
  try {
    // req.user.id ми беремо з токена (middleware подбав про це)
    const userId = req.user.id;

    // SQL: Дай мені категорії, де (власник = Я) АБО (це загальна категорія)
    const query = `
      SELECT * FROM categories 
      WHERE user_id = $1 OR is_default = TRUE
      ORDER BY type, name ASC;
    `;
    
    const { rows } = await db.query(query, [userId]);

    // Розділимо для зручності фронтенду
    const income = rows.filter(cat => cat.type === 'income');
    const expense = rows.filter(cat => cat.type === 'expense');

    res.json({ income, expense, all: rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка отримання категорій' });
  }
};

// Створити нову категорію
const createCategory = async (req, res) => {
  const { name, type, icon, color } = req.body;
  const userId = req.user.id;

  if (!name || !type) {
    return res.status(400).json({ error: 'Назва та тип обов’язкові' });
  }

  if (type !== 'income' && type !== 'expense') {
    return res.status(400).json({ error: 'Тип має бути income або expense' });
  }

  try {
    const query = `
      INSERT INTO categories (user_id, name, type, icon, color, is_default)
      VALUES ($1, $2, $3, $4, $5, FALSE)
      RETURNING *;
    `;

    // Якщо іконки немає, ставимо дефолтну "FaQuestion"
    const values = [userId, name, type, icon || 'FaQuestion', color || '#000000'];
    
    const newCategory = await db.query(query, values);
    
    res.status(201).json(newCategory.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Не вдалося створити категорію' });
  }
};

// Видалити категорію
const deleteCategory = async (req, res) => {
  const { id } = req.params; // ID категорії з URL
  const userId = req.user.id;

  try {
    // 1. Перевіряємо, чи ця категорія належить юзеру
    // Ми не дозволяємо видаляти системні категорії (is_default) або чужі
    const checkQuery = 'SELECT * FROM categories WHERE id = $1';
    const checkRes = await db.query(checkQuery, [id]);

    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'Категорію не знайдено' });
    }

    const category = checkRes.rows[0];

    // Якщо це системна категорія
    if (category.is_default) {
      return res.status(403).json({ error: 'Не можна видаляти системні категорії' });
    }

    // Якщо це чужа категорія (хакер намагається видалити)
    if (category.user_id !== userId) {
      return res.status(403).json({ error: 'Це не ваша категорія' });
    }

    // 2. Видаляємо
    await db.query('DELETE FROM categories WHERE id = $1', [id]);
    
    res.json({ message: 'Категорію видалено успішно' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка видалення' });
  }
};

module.exports = { getAllCategories, createCategory, deleteCategory };