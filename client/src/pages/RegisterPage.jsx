import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box, Button, TextField, Typography, Container, Paper, Link } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from '../utils/axios'; // Наш налаштований axios
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';
import { useSnackbar } from 'notistack'; // Спливаючі повідомлення

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
    },
    // Правила валідації
    validationSchema: Yup.object({
      username: Yup.string().required("Ім'я обов'язкове"),
      email: Yup.string().email('Некоректний email').required("Email обов'язковий"),
      password: Yup.string().min(6, 'Мінімум 6 символів').required("Пароль обов'язковий"),
    }),
    onSubmit: async (values) => {
      try {
        // Відправляємо дані на сервер
        const { data } = await axios.post('/auth/register', values);
        
        // Якщо успіх - зберігаємо юзера в Redux
        dispatch(setCredentials(data));
        
        enqueueSnackbar('Реєстрація успішна! Ласкаво просимо.', { variant: 'success' });
        navigate('/'); // Перекидаємо на головну
      } catch (err) {
        console.error(err);
        const errorMsg = err.response?.data?.error || 'Помилка реєстрації';
        enqueueSnackbar(errorMsg, { variant: 'error' });
      }
    },
  });

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Реєстрація 🚀
          </Typography>
          
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              fullWidth
              id="username"
              label="Ваше Ім'я"
              name="username"
              autoComplete="username"
              autoFocus
              value={formik.values.username}
              onChange={formik.handleChange}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
            />
            <TextField
              margin="normal"
              fullWidth
              id="email"
              label="Email адреса"
              name="email"
              autoComplete="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
            <TextField
              margin="normal"
              fullWidth
              name="password"
              label="Пароль"
              type="password"
              id="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, height: 50, fontSize: '1.1rem' }}
              disabled={formik.isSubmitting}
            >
              Зареєструватися
            </Button>
            
            <Box textAlign="center">
              <Link component={RouterLink} to="/login" variant="body2">
                {"Вже є акаунт? Увійти"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;