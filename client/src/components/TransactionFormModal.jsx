import { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, MenuItem, ToggleButton, ToggleButtonGroup, Box 
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from '../utils/axios';
import { useSnackbar } from 'notistack';

const TransactionFormModal = ({ open, onClose, onSuccess }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [categories, setCategories] = useState({ income: [], expense: [] });
  const [type, setType] = useState('expense'); // За замовчуванням - витрати

  // Завантажуємо категорії при відкритті
  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get('/categories');
      setCategories(data);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Не вдалося завантажити категорії', { variant: 'error' });
    }
  };

  const formik = useFormik({
    initialValues: {
      amount: '',
      description: '',
      category_id: '',
      date: new Date().toISOString().split('T')[0], // Сьогоднішня дата
    },
    validationSchema: Yup.object({
      amount: Yup.number().positive('Сума має бути більше 0').required("Введіть суму"),
      category_id: Yup.string().required("Оберіть категорію"),
      date: Yup.date().required(),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        await axios.post('/transactions', { ...values, type });
        enqueueSnackbar('Транзакцію додано!', { variant: 'success' });
        resetForm();
        onSuccess(); // Оновлюємо дашборд
        onClose();   // Закриваємо вікно
      } catch (error) {
        enqueueSnackbar('Помилка збереження', { variant: 'error' });
      }
    },
  });

  // Зміна типу (Дохід/Витрата)
  const handleTypeChange = (event, newType) => {
    if (newType !== null) {
      setType(newType);
      formik.setFieldValue('category_id', ''); // Скидаємо категорію при зміні типу
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        {type === 'expense' ? 'Нова витрата 💸' : 'Новий дохід 💰'}
      </DialogTitle>
      
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          {/* Перемикач Типу */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <ToggleButtonGroup
              value={type}
              exclusive
              onChange={handleTypeChange}
              color="primary"
            >
              <ToggleButton value="expense" color="error">Витрата</ToggleButton>
              <ToggleButton value="income" color="success">Дохід</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <TextField
            fullWidth
            margin="dense"
            label="Сума"
            name="amount"
            type="number"
            value={formik.values.amount}
            onChange={formik.handleChange}
            error={formik.touched.amount && Boolean(formik.errors.amount)}
            helperText={formik.touched.amount && formik.errors.amount}
          />

          <TextField
            select
            fullWidth
            margin="dense"
            label="Категорія"
            name="category_id"
            value={formik.values.category_id}
            onChange={formik.handleChange}
            error={formik.touched.category_id && Boolean(formik.errors.category_id)}
            helperText={formik.touched.category_id && formik.errors.category_id}
          >
            {/* Показуємо категорії відповідно до обраного типу */}
            {categories[type].map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            margin="dense"
            label="Опис (необов'язково)"
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
          />

          <TextField
            fullWidth
            margin="dense"
            label="Дата"
            type="date"
            name="date"
            InputLabelProps={{ shrink: true }}
            value={formik.values.date}
            onChange={formik.handleChange}
          />
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} color="inherit">Скасувати</Button>
          <Button type="submit" variant="contained" color="primary">
            Зберегти
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TransactionFormModal;