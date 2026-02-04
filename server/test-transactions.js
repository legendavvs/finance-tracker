const API_URL = 'http://localhost:5000/api';

// Унікальний юзер для тесту
const email = `money${Date.now()}@test.com`;
const password = 'pass';
let token = '';
let categoryId = '';

async function runTest() {
  try {
    console.log('--- 1. РЕЄСТРАЦІЯ ---');
    const regRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'MoneyMaker', email, password })
    });
    const regData = await regRes.json();
    token = regData.token;
    console.log(regRes.status === 201 ? '✅ ОК' : '❌ FAIL', regData.message || regData);

    console.log('\n--- 2. СТВОРЕННЯ КАТЕГОРІЇ ---');
    const catRes = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: 'Супер Їжа', type: 'expense', icon: 'FaBurger', color: '#ff0000' })
    });
    const catData = await catRes.json();
    categoryId = catData.id;
    console.log(catRes.status === 201 ? '✅ ОК' : '❌ FAIL', `ID категорії: ${categoryId}`);

    console.log('\n--- 3. ДОДАВАННЯ ТРАНЗАКЦІЙ ---');
    // Додаємо 3 транзакції
    for (let i = 1; i <= 3; i++) {
        await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ 
                amount: 100 * i, 
                type: 'expense', 
                category_id: categoryId, 
                date: '2024-10-25',
                description: `Бургер №${i}`
            })
        });
    }
    console.log('✅ 3 транзакції додано');

    console.log('\n--- 4. ОТРИМАННЯ СПИСКУ ---');
    const getRes = await fetch(`${API_URL}/transactions?limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const getData = await getRes.json();
    
    if (getData.transactions && getData.transactions.length === 3) {
        console.log('✅ Список отримано успішно!');
        console.log('Приклад транзакції:', getData.transactions[0]);
    } else {
        console.log('❌ Помилка: очікувалось 3 транзакції', getData);
    }

  } catch (err) {
    console.error('❌ CRITICAL ERROR:', err);
  }
}

runTest();