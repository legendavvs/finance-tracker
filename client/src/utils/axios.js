import axios from 'axios';

const instance = axios.create({
  // Магія: якщо є змінна середовища (на Vercel), беремо її.
  // Якщо немає (на комп'ютері), беремо localhost.
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Додаємо токен до кожного запиту, якщо він є
instance.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;