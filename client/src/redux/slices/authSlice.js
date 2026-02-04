import { createSlice } from '@reduxjs/toolkit';

// Пробуємо дістати юзера з пам'яті браузера, якщо він там є
const userFromStorage = localStorage.getItem('user') 
  ? JSON.parse(localStorage.getItem('user')) 
  : null;

const initialState = {
  user: userFromStorage, // Тепер при оновленні сторінки юзер підтягнеться звідси
  token: window.localStorage.getItem('token') || null,
  isAuth: Boolean(window.localStorage.getItem('token')),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuth = true;
      
      // Зберігаємо і токен, і дані юзера
      window.localStorage.setItem('token', token);
      window.localStorage.setItem('user', JSON.stringify(user)); // <--- ЗБЕРІГАЄМО ЮЗЕРА
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuth = false;
      
      // Чистимо все
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('user');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;