const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ВИКОРИСТОВУЙ EXTERNAL DATABASE URL ТУТ (тільки для ініціалізації)
const connectionString = "postgresql://finance_db_5ytg_user:IUk4BTvXCTkx6P5SRETfgFG4o7qVShab@dpg-d7j2g5l8nd3s73bd9760-a.frankfurt-postgres.render.com/finance_db_5ytg;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const setupDatabase = async () => {
  try {
    // Шлях до твого SQL файлу
    const sqlPath = path.join(__dirname, 'init_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log("⏳ Створюємо таблиці...");
    await pool.query(sql);
    console.log("✅ Таблиці успішно створені!");
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Помилка ініціалізації:", err);
    process.exit(1);
  }
};

setupDatabase();
