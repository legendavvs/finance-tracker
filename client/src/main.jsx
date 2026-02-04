import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Provider } from 'react-redux'; // Імпорт Redux провайдера
import { store } from './redux/store';  // Імпорт нашого створеного стору
import { SnackbarProvider } from 'notistack'; // Для красивих сповіщень
import { theme } from './theme';
import './index.css';


// Створимо темну/світлу тему (поки базову)
const darkTheme = createTheme({
  palette: {
    mode: 'dark', // Робимо зразу стильно - темна тема
    primary: {
      main: '#2ecc71', // Зелений (гроші)
    },
    secondary: {
      main: '#e74c3c', // Червоний (витрати)
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}> {/* Використовуємо theme з файлу */}
        <CssBaseline />
        <SnackbarProvider maxSnack={3}>
            <App />
        </SnackbarProvider>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
);