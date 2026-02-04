-- 1. Створення розширення для генерації UUID (опціонально, але професійно)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Таблиця Користувачів (Users)
-- Зберігаємо налаштування (валюту) прямо тут
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    currency VARCHAR(3) DEFAULT 'UAH', -- USD, EUR, UAH
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Таблиця Категорій (Categories)
-- is_default = TRUE для системних категорій (їх бачать всі), FALSE для користувацьких
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- NULL для загальних категорій
    name VARCHAR(50) NOT NULL,
    type VARCHAR(10) CHECK (type IN ('income', 'expense')) NOT NULL,
    icon VARCHAR(50), -- Назва іконки для Front-end (напр. 'FaShoppingBag')
    color VARCHAR(20), -- Hex код кольору для графіків
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Таблиця Транзакцій (Transactions)
-- Основна таблиця. Додаємо індекси для швидкодії аналітики
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    amount DECIMAL(15, 2) NOT NULL, -- Використовуємо DECIMAL для точних фінансів
    type VARCHAR(10) CHECK (type IN ('income', 'expense')) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    receipt_url TEXT, -- Посилання на фото чеку (на майбутнє)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Таблиця Бюджетів (Budgets)
-- Дозволяє ставити ліміт на категорію на конкретний місяць
CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
    amount_limit DECIMAL(15, 2) NOT NULL,
    period_month INTEGER NOT NULL CHECK (period_month BETWEEN 1 AND 12),
    period_year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, category_id, period_month, period_year) -- Один бюджет на категорію в місяць
);

-- 6. Таблиця Фінансових Цілей (Savings Goals) - "Фішка" для накопичень
CREATE TABLE savings_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(15, 2) NOT NULL,
    current_amount DECIMAL(15, 2) DEFAULT 0,
    deadline DATE,
    color VARCHAR(20),
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Індекси для прискорення вибірки даних (для Дашборда)
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_budgets_user_period ON budgets(user_id, period_month, period_year);

-- 8. Вставка базових категорій (Seed Data)
INSERT INTO categories (name, type, icon, color, is_default) VALUES
('Зарплата', 'income', 'FaWallet', '#2ecc71', TRUE),
('Фріланс', 'income', 'FaLaptop', '#27ae60', TRUE),
('Продукти', 'expense', 'FaShoppingCart', '#e74c3c', TRUE),
('Транспорт', 'expense', 'FaBus', '#3498db', TRUE),
('Розваги', 'expense', 'FaGamepad', '#9b59b6', TRUE),
('Житло', 'expense', 'FaHome', '#f1c40f', TRUE),
('Здоров''я', 'expense', 'FaMedkit', '#e67e22', TRUE),
('Освіта', 'expense', 'FaGraduationCap', '#1abc9c', TRUE);