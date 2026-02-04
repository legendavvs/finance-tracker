import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage'; // Імпортуємо нову сторінку
import MainLayout from './layouts/MainLayout'; // Імпортуємо макет

// Тимчасові заглушки для інших сторінок
const Placeholder = ({ title }) => <h1>{title} (В розробці)</h1>;

const PrivateRoute = ({ children }) => {
  const isAuth = useSelector((state) => state.auth.isAuth);
  return isAuth ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Всі ці маршрути будуть мати Sidebar і Header */}
        <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="transactions" element={<Placeholder title="Транзакції" />} />
          <Route path="categories" element={<Placeholder title="Категорії" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;