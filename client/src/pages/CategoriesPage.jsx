import { useEffect, useState } from 'react';
import { 
  Box, Typography, Grid, Paper, IconButton, Button, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, 
  MenuItem, CircularProgress 
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Folder as FolderIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from '../utils/axios';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false); // Для модалки додавання
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState('expense');
  
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get('/categories');
      // Бекенд повертає об'єкт { income: [], expense: [] }, об'єднуємо їх для відображення або показуємо окремо
      // Для зручності зробимо плоский список, додавши поле type
      const allCats = [
        ...data.income.map(c => ({...c, type: 'income'})),
        ...data.expense.map(c => ({...c, type: 'expense'}))
      ];
      setCategories(allCats);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Видалити цю категорію?')) return;
    try {
      await axios.delete(`/categories/${id}`);
      setCategories(prev => prev.filter(c => c.id !== id));
      enqueueSnackbar('Категорію видалено', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Помилка видалення (можливо, вона використовується)', { variant: 'error' });
    }
  };

  const handleAdd = async () => {
    if (!newCategoryName.trim()) return;
    try {
      // Відправляємо запит на створення
      const { data } = await axios.post('/categories', { 
        name: newCategoryName, 
        type: newCategoryType,
        color: '#6366F1' // Поки що дефолтний колір
      });
      
      // Оновлюємо список
      setCategories(prev => [...prev, data]);
      enqueueSnackbar('Категорію створено!', { variant: 'success' });
      setOpen(false);
      setNewCategoryName('');
    } catch (error) {
      enqueueSnackbar('Помилка створення', { variant: 'error' });
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Мої Категорії 📂</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          sx={{ background: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)' }}
        >
          Додати категорію
        </Button>
      </Box>

      {/* Список категорій */}
      <Grid container spacing={3}>
        {categories.map((cat) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={cat.id}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                bgcolor: 'background.paper',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 3,
                transition: '0.2s',
                '&:hover': { transform: 'translateY(-2px)', bgcolor: 'rgba(255,255,255,0.05)' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FolderIcon sx={{ color: cat.type === 'income' ? '#10B981' : '#F43F5E' }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">{cat.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {cat.type === 'income' ? 'Дохід' : 'Витрата'}
                  </Typography>
                </Box>
              </Box>
              
              <IconButton size="small" color="error" onClick={() => handleDelete(cat.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Модальне вікно додавання */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Нова категорія</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Назва категорії"
            fullWidth
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <TextField
            select
            margin="dense"
            label="Тип"
            fullWidth
            value={newCategoryType}
            onChange={(e) => setNewCategoryType(e.target.value)}
          >
            <MenuItem value="expense">Витрата</MenuItem>
            <MenuItem value="income">Дохід</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit">Скасувати</Button>
          <Button onClick={handleAdd} variant="contained" color="primary">Додати</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoriesPage;