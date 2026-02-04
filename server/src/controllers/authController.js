const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Реєстрація нового користувача
const register = async (req, res) => {
  const { username, email, password } = req.body;

  // 1. Проста валідація
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Будь ласка, заповніть всі поля' });
  }

  try {
    // 2. Перевіряємо, чи такий email вже є
    const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Користувач з таким email вже існує' });
    }

    // 3. Хешуємо пароль (шифруємо, щоб ніхто не вкрав)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Записуємо в Базу Даних
    const newUser = await db.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, currency',
      [username, email, passwordHash]
    );

    // 5. Генеруємо токен (перепустку)
    const token = jwt.sign(
      { id: newUser.rows[0].id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '30d' } // Токен діє 30 днів
    );

    // 6. Віддаємо результат клієнту
    res.status(201).json({
      token,
      user: newUser.rows[0],
      message: 'Реєстрація успішна!'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка сервера при реєстрації' });
  }
};

// Логін (Вхід)
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Введіть email та пароль' });
  }

  try {
    // 1. Шукаємо користувача
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(400).json({ error: 'Невірний email або пароль' });
    }

    // 2. Перевіряємо пароль (порівнюємо введений з зашифрованим)
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Невірний email або пароль' });
    }

    // 3. Генеруємо токен
    const token = jwt.sign(
      { id: user.id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '30d' }
    );

    // 4. Відправляємо відповідь (без пароля!)
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        currency: user.currency,
        avatar_url: user.avatar_url
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка сервера при вході' });
  }
};

module.exports = { register, login };