const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  // 1. Перевіряємо, чи є заголовок Authorization і чи починається він з Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 2. Витягуємо сам токен (відкидаємо слово "Bearer ")
      token = req.headers.authorization.split(' ')[1];

      // 3. Розшифровуємо токен
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Додаємо ID користувача до запиту, щоб наступні функції знали, хто це
      req.user = { id: decoded.id };

      next(); // Пропускаємо далі
    } catch (error) {
      console.error(error);
      res.status(401).json({ error: 'Не авторизовано, токен невірний' });
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Не авторизовано, немає токена' });
  }
};

module.exports = { protect };