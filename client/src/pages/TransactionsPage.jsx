import { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, CircularProgress,
    TextField, MenuItem, InputAdornment, Grid
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    ArrowUpward,
    ArrowDownward,
    Search as SearchIcon,
    FilterAlt as FilterIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from '../utils/axios';
import TransactionFormModal from '../components/TransactionFormModal';

const TransactionsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- СТАНИ ДЛЯ ФІЛЬТРІВ ---
    const [search, setSearch] = useState('');
    const [month, setMonth] = useState(new Date().getMonth() + 1); // Поточний місяць
    const [year, setYear] = useState(new Date().getFullYear());    // Поточний рік
    // --------------------------

    const [openModal, setOpenModal] = useState(false);
    const [editData, setEditData] = useState(null);

    const { enqueueSnackbar } = useSnackbar();

    // Оновлюємо список, коли змінюється будь-який фільтр
    useEffect(() => {
        // Робимо невелику затримку для пошуку (debounce), щоб не спамити запитами
        const delayDebounceFn = setTimeout(() => {
            fetchTransactions();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [search, month, year]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            // Передаємо параметри на сервер
            const { data } = await axios.get('/transactions', {
                params: {
                    limit: 100,
                    search: search || undefined, // Якщо пустий рядок - не відправляємо
                    month,
                    year
                }
            });
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

    const handleEdit = (transaction) => {
        setEditData(transaction);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditData(null);
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Історія транзакцій 📜</Typography>

            {/* --- ПАНЕЛЬ ФІЛЬТРІВ --- */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <Grid container spacing={2} alignItems="center">

                    {/* Пошук */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            placeholder="Пошук (наприклад: Кава)"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            size="small"
                        />
                    </Grid>

                    {/* Вибір Місяця */}
                    <Grid item xs={6} md={3}>
                        <TextField
                            select
                            fullWidth
                            label="Місяць"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            size="small"
                        >
                            <MenuItem value={1}>Січень</MenuItem>
                            <MenuItem value={2}>Лютий</MenuItem>
                            <MenuItem value={3}>Березень</MenuItem>
                            <MenuItem value={4}>Квітень</MenuItem>
                            <MenuItem value={5}>Травень</MenuItem>
                            <MenuItem value={6}>Червень</MenuItem>
                            <MenuItem value={7}>Липень</MenuItem>
                            <MenuItem value={8}>Серпень</MenuItem>
                            <MenuItem value={9}>Вересень</MenuItem>
                            <MenuItem value={10}>Жовтень</MenuItem>
                            <MenuItem value={11}>Листопад</MenuItem>
                            <MenuItem value={12}>Грудень</MenuItem>
                        </TextField>
                    </Grid>

                    {/* Вибір Року */}
                    <Grid item xs={6} md={3}>
                        <TextField
                            select
                            fullWidth
                            label="Рік"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            size="small"
                        >
                            <MenuItem value={2024}>2024</MenuItem>
                            <MenuItem value={2025}>2025</MenuItem>
                            <MenuItem value={2026}>2026</MenuItem>
                            <MenuItem value={2027}>2027</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>
            </Paper>
            {/* ----------------------- */}

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
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}><CircularProgress size={30} /></TableCell>
                            </TableRow>
                        ) : transactions.length > 0 ? (
                            transactions.map((t) => (
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
                                        <IconButton onClick={() => handleEdit(t)} color="primary" size="small" sx={{ mr: 1 }}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(t.id)} color="error" size="small">
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                    <Typography color="text.secondary">
                                        Записів не знайдено за цей період 🔍
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TransactionFormModal
                open={openModal}
                onClose={handleCloseModal}
                onSuccess={fetchTransactions}
                transactionToEdit={editData}
            />
        </Box>
    );
};

export default TransactionsPage;