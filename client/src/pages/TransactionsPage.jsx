import { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, CircularProgress 
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from '../utils/axios';
import TransactionFormModal from '../components/TransactionFormModal'; // Імпорт модалки

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Стани для модалки редагування
  const [openModal, setOpenModal] = useState(false);
  const [editData, setEditData] = useState(null); // Тут буде лежати транзакція, яку редагуємо

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data } = await axios.get('/transactions?limit=50');
      setTransactions(data.transactions);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Видалити цей запис?')) return;
    try {
      await axios.delete(`/transactions/${id}`);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      enqueueSnackbar('Запис видалено', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Помилка видалення', { variant: 'error' });
    }
  };

  // Відкриває модалку з даними
  const handleEdit = (transaction) => {
    setEditData(transaction);
    setOpenModal(true);
  };

  // Закриває модалку і очищає дані
  const handleCloseModal = () => {
    setOpenModal(false);
    setEditData(null);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Історія транзакцій 📜</Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Дата</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Категорія</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Опис</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Сума</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold', textAlign: 'right' }}>Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((t) => (
              <TableRow key={t.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' } }}>
                <TableCell component="th" scope="row">{new Date(t.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {t.type === 'income' ? <ArrowUpward color="success" fontSize="small" /> : <ArrowDownward color="error" fontSize="small" />}
                      {t.category_name || 'Без категорії'}
                  </Box>
                </TableCell>
                <TableCell>{t.description || '-'}</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: t.type === 'income' ? 'success.main' : 'error.main' }}>
                  {t.type === 'income' ? '+' : '-'} {parseFloat(t.amount).toFixed(2)} ₴
                </TableCell>
                <TableCell align="right">
                  {/* Кнопка РЕДАГУВАННЯ */}
                  <IconButton onClick={() => handleEdit(t)} color="primary" size="small" sx={{ mr: 1 }}>
                    <EditIcon />
                  </IconButton>
                  
                  {/* Кнопка ВИДАЛЕННЯ */}
                  <IconButton onClick={() => handleDelete(t.id)} color="error" size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Модальне вікно (Спільне для редагування) */}
      <TransactionFormModal 
        open={openModal} 
        onClose={handleCloseModal} 
        onSuccess={fetchTransactions} 
        transactionToEdit={editData} // Передаємо дані для редагування
      />
    </Box>
  );
};

export default TransactionsPage;