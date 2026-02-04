

const API_URL = 'http://localhost:5000/api/auth';

// Тестовий юзер
const testUser = {
  username: 'TestUser',
  email: `test${Date.now()}@example.com`, // Унікальний email кожен раз
  password: 'password123'
};

async function testAuth() {
  console.log('--- 1. ПРОБУЄМО ЗАРЕЄСТРУВАТИСЬ ---');
  
  try {
    const regRes = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    const regData = await regRes.json();
    console.log('Статус:', regRes.status);
    console.log('Відповідь:', regData);

    if (regRes.status === 201) {
      console.log('✅ РЕЄСТРАЦІЯ УСПІШНА!');
      const token = regData.token;

      console.log('\n--- 2. ПРОБУЄМО УВІЙТИ (LOGIN) ---');
      const loginRes = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testUser.email, password: testUser.password })
      });

      const loginData = await loginRes.json();
      console.log('Статус:', loginRes.status);
      console.log('Токен отримано:', loginData.token ? 'ТАК' : 'НІ');
      
      if (loginData.token === token) {
         console.log('✅ ТОКЕНИ СПІВПАДАЮТЬ. ЛОГІН ПРАЦЮЄ!');
      }

    } else {
      console.log('❌ ПОМИЛКА РЕЄСТРАЦІЇ');
    }

  } catch (err) {
    console.error('❌ ПОМИЛКА ПІДКЛЮЧЕННЯ:', err.message);
  }
}

testAuth();