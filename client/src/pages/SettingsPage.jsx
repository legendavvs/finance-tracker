import { useState } from 'react';
// ДОДАНО Grid в імпорт 👇
import { Box, Typography, Paper, TextField, Button, Avatar, Divider, Grid } from '@mui/material';
import { Save as SaveIcon, AccountCircle } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import axios from '../utils/axios';
import { setCredentials } from '../redux/slices/authSlice';

const SettingsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (password && password !== confirmPassword) {
      enqueueSnackbar('Паролі не співпадають', { variant: 'error' });
      return;
    }

    try {
      const { data } = await axios.put('/users/profile', { 
        username, 
        password: password || undefined 
      });

      dispatch(setCredentials({ user: data, token: window.localStorage.getItem('token') }));
      
      enqueueSnackbar('Профіль оновлено успішно!', { variant: 'success' });
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Помилка оновлення', { variant: 'error' });
    }
  };

  return (
    <Box maxWidth="md" mx="auto">
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Налаштування профілю ⚙️</Typography>

      <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 40, mr: 3 }}>
            <AccountCircle fontSize="inherit" />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">{user?.username}</Typography>
            <Typography variant="body1" color="text.secondary">{user?.email}</Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <form onSubmit={handleUpdate}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
                <Typography variant="h6" sx={{ ml: 1, mb: 1 }}>Змінити дані</Typography>
                <TextField
                fullWidth
                label="Ваше ім'я"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{ mb: 3 }}
                />
            </Grid>

            <Grid item xs={12}>
                <Typography variant="h6" sx={{ ml: 1, mb: 1 }}>Зміна паролю (необов'язково)</Typography>
                <TextField
                fullWidth
                type="password"
                label="Новий пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2 }}
                />
                <TextField
                fullWidth
                type="password"
                label="Підтвердіть новий пароль"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{ mb: 3 }}
                />
            </Grid>

            <Grid item xs={12}>
                <Button 
                type="submit" 
                variant="contained" 
                size="large"
                startIcon={<SaveIcon />}
                sx={{ background: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)' }}
                >
                Зберегти зміни
                </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default SettingsPage;