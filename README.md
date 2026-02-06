# 💰 AI-Powered Personal Finance Tracker

[🇺🇦 Українська версія нижче](#-персональний-фінансовий-трекер-з-ші)

A modern full-stack application for tracking income and expenses with integrated Artificial Intelligence. The app allows users to analyze their financial status, receive smart advice from Gemini AI, and add transactions using voice commands.

![Project Status](https://img.shields.io/badge/Status-Completed-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Key Features

* **📊 Interactive Dashboard:** Visual analytics of income and expenses using dynamic charts.
* **🤖 AI Financial Advisor:** Integrated Google Gemini AI that analyzes your transaction history and provides personalized financial advice via chat.
* **🎤 Voice Input:** Add transactions using voice commands (e.g., "Coffee 50", "Salary 2000"). The system automatically parses the amount, category, and description.
* **🌗 Dark/Light Mode:** Fully adaptive UI with theme switching support.
* **🔐 Secure Authentication:** User registration and login with JWT protection.
* **📱 Responsive Design:** Optimized for both desktop and mobile devices.

## 🛠 Tech Stack

**Frontend:**
* React.js (Vite)
* Material UI (MUI)
* Redux Toolkit / Context API
* Chart.js / Recharts
* Web Speech API

**Backend:**
* Node.js & Express
* PostgreSQL
* Google Gemini API (2.5 Flash)
* JWT & Bcrypt

## 🚀 Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/legendavvs/finance-tracker.git](https://github.com/legendavvs/finance-tracker.git)
    ```
2.  **Install dependencies (Client & Server):**
    ```bash
    cd client && npm install
    cd ../server && npm install
    ```
3.  **Setup Environment Variables:**
    Create `.env` files in both folders based on the examples. You will need a Gemini API Key and PostgreSQL credentials.
4.  **Run the app:**
    ```bash
    # Run Backend
    cd server && npm run dev
    # Run Frontend
    cd client && npm run dev
    ```

---

# 🇺🇦 Персональний Фінансовий Трекер з ШІ

Сучасний full-stack додаток для обліку доходів та витрат з інтегрованим штучним інтелектом. Додаток дозволяє аналізувати фінансовий стан, отримувати розумні поради від Gemini AI та додавати транзакції голосом.

## ✨ Основні можливості

* **📊 Інтерактивний Дашборд:** Візуальна аналітика доходів та витрат за допомогою динамічних графіків.
* **🤖 AI Фін-консультант:** Інтегрований Google Gemini AI, який аналізує історію транзакцій та дає персональні поради у чаті.
* **🎤 Голосове введення:** Додавання транзакцій голосом (наприклад: "Кава 50", "Зарплата 20000"). Система сама розпізнає суму, категорію та опис.
* **🌗 Темна/Світла теми:** Повністю адаптивний інтерфейс з перемикачем тем.
* **🔐 Безпека:** Реєстрація та вхід з використанням JWT токенів.
* **📱 Адаптивність:** Зручна робота як на ПК, так і на телефоні.

## 🛠 Технологічний стек

**Frontend:**
* React.js (Vite)
* Material UI (MUI)
* Redux Toolkit / Context API
* Chart.js / Recharts
* Web Speech API

**Backend:**
* Node.js & Express
* PostgreSQL
* Google Gemini API (2.5 Flash)
* JWT & Bcrypt