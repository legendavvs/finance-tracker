import { useState, useMemo } from 'react'; // Додані хуки
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { IconButton, Box, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';

// Імпорт сторінок
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import CategoriesPage from './pages/CategoriesPage';
import SettingsPage from './pages/SettingsPage';
import MainLayout from './layouts/MainLayout';

// Захищений маршрут (перевірка авторизації)
const PrivateRoute = ({ children }) => {
  const isAuth = useSelector((state) => state.auth.isAuth);
  return isAuth ? children : <Navigate to="/login" />;
};

function App() {
  // 1. Логіка теми (зчитування з пам'яті)
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'light';
  });

  // 2. Функція перемикання
  const toggleColorMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  // 3. Налаштування палітри
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'dark'
            ? {
                // Темна тема
                background: {
                  default: '#121212',
                  paper: '#020202',
                },
                text: {
                  primary: '#ffffff',
                  secondary: '#b0b8c4',
                }
              }
            : {
                // Світла тема
                background: {
                  default: '#f5f7fa', // Трохи сіруватий приємний фон
                  paper: '#ffffff',
                },
              }),
        },
      }),
    [mode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Скидання стилів браузера під тему */}
      
      <BrowserRouter>
        
        {/* КНОПКА ЗМІНИ ТЕМИ (Плаваюча в правому нижньому куті) */}
        <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
          <Tooltip title="Змінити тему">
            <IconButton 
              onClick={toggleColorMode} 
              color="inherit" 
              sx={{ 
                bgcolor: 'background.paper', 
                boxShadow: 3,
                width: 50,
                height: 50,
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              {mode === 'dark' ? <Brightness7 color="warning" /> : <Brightness4 color="primary" />}
            </IconButton>
          </Tooltip>
        </Box>

        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Захищені маршрути всередині MainLayout */}
          <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          
          {/* Маршрут для будь-якої неіснуючої сторінки -> на головну */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;