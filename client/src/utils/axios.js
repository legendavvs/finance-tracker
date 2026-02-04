import axios from 'axios';

// Створюємо екземпляр з базовими налаштуваннями
const instance = axios.create({
  baseURL: '/api', // Завдяки проксі у vite.config.js це піде на localhost:5000
});

// --- МАГІЯ (Interceptor) ---
// Перед кожним запитом цей код перевіряє, чи є токен у localStorage
instance.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export default instance;