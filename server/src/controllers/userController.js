const db = require('../db');
const bcrypt = require('bcryptjs');

// Отримати дані користувача
const getMe = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT id, username, email FROM users WHERE id = $1', [req.user.id]);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Помилка сервера' });
    }
};

// Оновити профіль (ім'я та пароль)
const updateProfile = async (req, res) => {
    const { username, password } = req.body;
    const userId = req.user.id;

    try {
        let query = 'UPDATE users SET username = $1';
        let values = [username];

        // Якщо користувач хоче змінити пароль
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            query += ', password = $2';
            values.push(hashedPassword);
        }

        query += ` WHERE id = $${values.length + 1} RETURNING id, username, email`;
        values.push(userId);

        const { rows } = await db.query(query, values);
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Помилка оновлення профілю' });
    }
};

module.exports = { getMe, updateProfile };