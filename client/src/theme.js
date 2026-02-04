import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366F1', // Indigo (Сучасний синій)
    },
    background: {
      default: '#0B0F19', // Deep Space (Дуже темний, майже чорний)
      paper: '#111827',   // Gray 900 (Для карток)
    },
    text: {
      primary: '#F3F4F6', // Майже білий
      secondary: '#9CA3AF', // Світло-сірий
    },
  },
  typography: {
    fontFamily: "'Poppins', 'Inter', sans-serif", // Основний шрифт
    h1: { fontFamily: "'Poppins', sans-serif", fontWeight: 700 },
    h2: { fontFamily: "'Poppins', sans-serif", fontWeight: 700 },
    h3: { fontFamily: "'Poppins', sans-serif", fontWeight: 600 },
    h4: { fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: '0.5px' },
    h5: { fontFamily: "'Poppins', sans-serif", fontWeight: 600 },
    h6: { fontFamily: "'Poppins', sans-serif", fontWeight: 500 },
    subtitle1: { fontFamily: "'Inter', sans-serif" }, // Для тексту
    body1: { fontFamily: "'Inter', sans-serif" },     // Для тексту
    body2: { fontFamily: "'Inter', sans-serif" },     // Для дрібного тексту
    button: { 
      fontFamily: "'Poppins', sans-serif", 
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.5px'
    },
  },
  shape: {
    borderRadius: 16, // Сильне заокруглення (Modern Look)
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: "#334155 #0B0F19",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: "#0B0F19",
            width: "8px",
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: "#334155",
            minHeight: 24,
          },
        },
      },
    },
  },
});