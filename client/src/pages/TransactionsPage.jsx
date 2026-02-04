import { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Chip, CircularProgress
} from '@mui/material';
import { Delete as DeleteIcon, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from '../utils/axios';

const TransactionsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();

    // Завантажуємо транзакції при відкритті сторінки
    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            // Беремо останні 50 транзакцій
            const { data } = await axios.get('/transactions?limit=50');
            setTransactions(data.transactions);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Функція видалення
    const handleDelete = async (id) => {
        if (!window.confirm('Ви впевнені, що хочете видалити цей запис?')) return;

        try {
            await axios.delete(`/transactions/${id}`);
            setTransactions((prev) => prev.filter((t) => t.id !== id)); // Прибираємо з екрану без перезавантаження
            enqueueSnackbar('Запис видалено', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Помилка видалення', { variant: 'error' });
        }
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
                        {transactions.length > 0 ? (
                            transactions.map((t) => (
                                <TableRow key={t.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' } }}>
                                    {/* Дата */}
                                    <TableCell component="th" scope="row">
                                        {new Date(t.date).toLocaleDateString()}
                                    </TableCell>

                                    {/* Категорія з іконкою типу */}
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {t.type === 'income'
                                                ? <ArrowUpward color="success" fontSize="small" />
                                                : <ArrowDownward color="error" fontSize="small" />
                                            }
                                            {t.category_name || 'Без категорії'}
                                        </Box>
                                    </TableCell>

                                    {/* Опис */}
                                    <TableCell>{t.description || '-'}</TableCell>

                                    {/* Сума (зелена або червона) */}
                                    <TableCell sx={{ fontWeight: 'bold', color: t.type === 'income' ? 'success.main' : 'error.main' }}>
                                        {t.type === 'income' ? '+' : '-'} {parseFloat(t.amount).toFixed(2)} ₴
                                    </TableCell>

                                    {/* Кнопка видалення */}
                                    <TableCell align="right">
                                        <IconButton onClick={() => handleDelete(t.id)} color="error" size="small">
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                    <Typography color="text.secondary">Транзакцій поки немає</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default TransactionsPage;