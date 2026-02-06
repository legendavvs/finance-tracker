import { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, MenuItem, ToggleButton, ToggleButtonGroup, Box 
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from '../utils/axios';
import { useSnackbar } from 'notistack';

// Додали проп "transactionToEdit"
const TransactionFormModal = ({ open, onClose, onSuccess, transactionToEdit }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [categories, setCategories] = useState({ income: [], expense: [] });
  const [type, setType] = useState('expense');

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  // Магія: Якщо є transactionToEdit, ми заповнюємо форму її даними
  // Якщо ні - ставимо дефолтні
  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      formik.setValues({
        amount: transactionToEdit.amount,
        description: transactionToEdit.description || '',
        category_id: transactionToEdit.category_id,
        date: transactionToEdit.date.split('T')[0], // Форматуємо дату для інпуту
      });
    } else {
      // Скидаємо форму для нового запису
      setType('expense');
      formik.resetForm();
      formik.setFieldValue('date', new Date().toISOString().split('T')[0]);
    }
  }, [transactionToEdit, open]);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get('/categories');
      setCategories(data);
    } catch (error) {
      console.error(error);
    }
  };

  const formik = useFormik({
    initialValues: {
      amount: '',
      description: '',
      category_id: '',
      date: new Date().toISOString().split('T')[0],
    },
    validationSchema: Yup.object({
      amount: Yup.number().positive('Більше 0').required("Введіть суму"),
      category_id: Yup.string().required("Оберіть категорію"),
      date: Yup.date().required(),
    }),
    onSubmit: async (values) => {
      try {
        if (transactionToEdit) {
          // --- РЕДАГУВАННЯ ---
          await axios.put(`/transactions/${transactionToEdit.id}`, { ...values, type });
          enqueueSnackbar('Транзакцію оновлено!', { variant: 'info' });
        } else {
          // --- СТВОРЕННЯ ---
          await axios.post('/transactions', { ...values, type });
          enqueueSnackbar('Транзакцію додано!', { variant: 'success' });
        }
        
        onSuccess(); 
        onClose();
      } catch (error) {
        enqueueSnackbar('Помилка збереження', { variant: 'error' });
      }
    },
  });

  const handleTypeChange = (event, newType) => {
    if (newType !== null) {
      setType(newType);
      formik.setFieldValue('category_id', '');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        {transactionToEdit ? 'Редагувати запис ✏️' : (type === 'expense' ? 'Нова витрата 💸' : 'Новий дохід 💰')}
      </DialogTitle>
      
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <ToggleButtonGroup
              value={type}
              exclusive
              onChange={handleTypeChange}
              color="primary"
            >
              <ToggleButton value="expense" color="error" sx={{ fontWeight: 'bold' }}>Витрата</ToggleButton>
              <ToggleButton value="income" color="success" sx={{ fontWeight: 'bold' }}>Дохід</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <TextField
            fullWidth margin="dense" label="Сума" name="amount" type="number"
            value={formik.values.amount} onChange={formik.handleChange}
            error={formik.touched.amount && Boolean(formik.errors.amount)}
            helperText={formik.touched.amount && formik.errors.amount}
          />

          <TextField
            select fullWidth margin="dense" label="Категорія" name="category_id"
            value={formik.values.category_id} onChange={formik.handleChange}
            error={formik.touched.category_id && Boolean(formik.errors.category_id)}
            helperText={formik.touched.category_id && formik.errors.category_id}
          >
            {categories[type] && categories[type].map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth margin="dense" label="Опис" name="description"
            value={formik.values.description} onChange={formik.handleChange}
          />

          <TextField
            fullWidth margin="dense" label="Дата" type="date" name="date"
            InputLabelProps={{ shrink: true }}
            value={formik.values.date} onChange={formik.handleChange}
          />
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} color="inherit">Скасувати</Button>
          <Button type="submit" variant="contained" color="primary">
            {transactionToEdit ? 'Оновити' : 'Зберегти'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TransactionFormModal;