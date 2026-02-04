import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box, Button, TextField, Typography, Container, Paper, Link } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';
import { useSnackbar } from 'notistack';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Некоректний email').required("Email обов'язковий"),
      password: Yup.string().required("Пароль обов'язковий"),
    }),
    onSubmit: async (values) => {
      try {
        const { data } = await axios.post('/auth/login', values);
        dispatch(setCredentials(data));
        enqueueSnackbar('Ви успішно увійшли!', { variant: 'success' });
        navigate('/');
      } catch (err) {
        console.error(err);
        const errorMsg = err.response?.data?.error || 'Помилка входу';
        enqueueSnackbar(errorMsg, { variant: 'error' });
      }
    },
  });

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Вхід у систему 🔐
          </Typography>
          
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              fullWidth
              id="email"
              label="Email адреса"
              name="email"
              autoComplete="email"
              autoFocus
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
              Увійти
            </Button>
            
            <Box textAlign="center">
              <Link component={RouterLink} to="/register" variant="body2">
                {"Немає акаунту? Зареєструватися"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;