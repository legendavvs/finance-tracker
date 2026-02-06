const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require('../db');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getChatAdvice = async (req, res) => {
    const userId = req.user.id;
    const { message } = req.body; // Питання користувача

    try {
        // 1. Отримуємо фінансовий контекст користувача (останні 20 транзакцій)
        const txRes = await db.query(`
      SELECT t.date, t.amount, t.type, t.description, c.name as category 
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1
      ORDER BY t.date DESC LIMIT 20
    `, [userId]);

        const transactions = txRes.rows;

        // 2. Формуємо промпт (інструкцію) для Gemini
        // Ми перетворюємо транзакції в текст, щоб AI їх "прочитав"
        const dataContext = JSON.stringify(transactions);

        const prompt = `
        Ти - фінансовий консультант. Твоя задача - давати короткі, корисні поради українською мовою.
        Ось останні фінансові транзакції користувача: ${dataContext}.
        
        Користувач запитує: "${message}"
        
        Якщо питання загальне - відповідай загально. Якщо питання про економію - проаналізуй транзакції і скажи, де він витрачає забагато.
        Відповідай дружньо, використовуй емодзі. Не пиши надто довгі тексти.
    `;

        // 3. Відправляємо запит до Gemini 1.5 Flash
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });

    } catch (err) {
        console.error("Gemini Error:", err);
        res.status(500).json({ error: "ШІ зараз відпочиває, спробуйте пізніше" });
    }
};

const parseTransaction = async (req, res) => {
    const { text } = req.body;
    const userId = req.user.id;

    try {
        // 1. Спочатку дістанемо категорії користувача, щоб AI вибрав правильну
        const catRes = await db.query('SELECT id, name FROM categories WHERE user_id = $1', [userId]);
        const categories = catRes.rows.map(c => c.name).join(', ');

        // 2. Інструкція для Gemini
        const prompt = `
      Твоя задача: витягнути дані про витрату з тексту: "${text}".
      
      Доступні категорії користувача: [${categories}].
      
      Поверни ВИНЯТКОВО JSON об'єкт (без markdown, без пояснень) у такому форматі:
      {
        "amount": число,
        "description": "короткий опис з тексту",
        "categoryName": "назва найбільш підходящої категорії зі списку вище (або null якщо неясно)",
        "type": "expense" (або "income" якщо це схоже на зарплату чи дохід)
      }
    `;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Чистимо відповідь від можливих символів ```json ... ```
        const cleanJson = responseText.replace(/```json|```/g, '').trim();
        const parsedData = JSON.parse(cleanJson);

        // Знаходимо ID категорії по назві
        if (parsedData.categoryName) {
            const matchedCat = catRes.rows.find(c => c.name === parsedData.categoryName);
            if (matchedCat) parsedData.categoryId = matchedCat.id;
        }

        res.json(parsedData);

    } catch (err) {
        console.error("AI Parse Error:", err);
        res.status(500).json({ error: "Не вдалося розпізнати дані" });
    }
};

module.exports = { getChatAdvice, parseTransaction };