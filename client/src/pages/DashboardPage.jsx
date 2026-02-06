import { useEffect, useState } from 'react';
import {
    Grid, Typography, Box, CircularProgress, Avatar, Paper, Button
} from '@mui/material';
import {
    ArrowUpward, ArrowDownward, AccountBalanceWallet, TrendingUp, TrendingDown, Add as AddIcon
} from '@mui/icons-material';
import axios from '../utils/axios';
import StatCard from '../components/StatCard';
import TransactionFormModal from '../components/TransactionFormModal';
import ChartSection from '../components/ChartSection';
import AIChatWidget from '../components/AIChatWidget';
import VoiceInput from '../components/VoiceInput'; // 1. Додав імпорт

const DashboardPage = () => {
    const [loading, setLoading] = useState(true);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [stats, setStats] = useState({ income: 0, expense: 0, balance: 0 });

    // 2. Нові стейти для голосу
    const [aiFormData, setAiFormData] = useState(null);
    const [voiceLoading, setVoiceLoading] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [txRes, statsRes, chartRes] = await Promise.all([
                axios.get('/transactions?limit=5'),
                axios.get('/transactions/stats'),
                axios.get('/transactions/categories-stats')
            ]);

            setRecentTransactions(txRes.data.transactions);
            setStats(statsRes.data);
            setChartData(chartRes.data);

        } catch (error) {
            console.error("Помилка завантаження:", error);
        } finally {
            setLoading(false);
        }
    };

    // 3. Функція обробки результату з мікрофона
    const handleVoiceResult = async (text) => {
        console.log("🎤 1. Голос розпізнано:", text); // <--- МАЯЧОК 1
        setVoiceLoading(true);
        try {
            console.log("🚀 2. Відправляю на сервер..."); // <--- МАЯЧОК 2
            const { data } = await axios.post('/chat/parse', { text });
            console.log("✅ 3. Сервер відповів:", data); // <--- МАЯЧОК 3
            
            setAiFormData({
                amount: data.amount,
                description: data.description || text,
                categoryId: data.categoryId || '',
                type: data.type || 'expense'
            });
            console.log("🔓 4. Відкриваю вікно..."); // <--- МАЯЧОК 4
            setIsModalOpen(true); // Відкриваємо форму з даними
            
        } catch (error) {
            console.error(error);
            alert("Не вдалося розпізнати команду. Спробуйте ще раз.");
            console.error("❌ ПОМИЛКА:", error);
        } finally {
            setVoiceLoading(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress color="primary" /></Box>;

    return (
        <Box sx={{ pb: 5 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Огляд фінансів</Typography>
                
                {/* Група кнопок: Додати + Мікрофон */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setAiFormData(null); // Очищаємо старі дані AI при ручному відкритті
                            setIsModalOpen(true);
                        }}
                        sx={{
                            background: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
                            px: 3, py: 1, fontWeight: 'bold', boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.4)'
                        }}
                    >
                        Додати транзакцію
                    </Button>
                    
                    {/* 4. Кнопка мікрофона */}
                    <VoiceInput onResult={handleVoiceResult} disabled={voiceLoading} />
                </Box>
            </Box>

            {/* Статистика */}
            <Grid container spacing={3} sx={{ mb: 6 }}>
                <Grid item xs={12} md={4}>
                    <StatCard title="Загальний Баланс" value={`₴ ${stats.balance.toLocaleString()}`} icon={<AccountBalanceWallet fontSize="inherit" />} gradient="linear-gradient(135deg, #4F46E5 0%, #312E81 100%)" />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard title="Доходи" value={`+ ₴ ${stats.income.toLocaleString()}`} icon={<TrendingUp fontSize="inherit" />} gradient="linear-gradient(135deg, #059669 0%, #064E3B 100%)" />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard title="Витрати" value={`- ₴ ${stats.expense.toLocaleString()}`} icon={<TrendingDown fontSize="inherit" />} gradient="linear-gradient(135deg, #BE123C 0%, #881337 100%)" />
                </Grid>
            </Grid>

            {/* --- ОСНОВНА СЕКЦІЯ: ДІАГРАМА + ТРАНЗАКЦІЇ --- */}
            <Grid container spacing={4}>

                {/* Ліва колонка: Діаграма */}
                <Grid item xs={12} md={7}>
                    <ChartSection data={chartData} />
                </Grid>

                {/* Права колонка: Останні транзакції */}
                <Grid item xs={12} md={5}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Останні операції</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {recentTransactions.length > 0 ? (
                            recentTransactions.map(t => (
                                <Paper key={t.id} elevation={0} sx={{ p: 2, display: 'flex', alignItems: 'center', borderRadius: 3, border: '1px solid rgba(255, 255, 255, 0.05)', bgcolor: 'background.paper', transition: '0.2s', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' } }}>
                                    <Avatar sx={{ bgcolor: t.type === 'income' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)', color: t.type === 'income' ? '#10B981' : '#F43F5E', mr: 2, borderRadius: 3 }}>
                                        {t.category_name ? t.category_name[0].toUpperCase() : (t.type === 'income' ? <ArrowUpward /> : <ArrowDownward />)}
                                    </Avatar>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="body1" fontWeight="600">{t.description || 'Без опису'}</Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{new Date(t.date).toLocaleDateString()} • {t.category_name || 'Інше'}</Typography>
                                    </Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: t.type === 'income' ? '#10B981' : '#F43F5E' }}>
                                        {t.type === 'income' ? '+' : '-'} {parseFloat(t.amount).toFixed(0)} ₴
                                    </Typography>
                                </Paper>
                            ))
                        ) : (
                            <Typography color="text.secondary">Тут буде історія ваших витрат.</Typography>
                        )}
                    </Box>
                </Grid>

                {/* AI Чат-Віджет (залишив як у тебе було) */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                       {/* Пусте місце або контент, як у тебе було */}
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <AIChatWidget />
                    </Grid>
                </Grid>
            </Grid>

            {/* 5. Передаємо initialValues у форму */}
            <TransactionFormModal 
                open={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchDashboardData} 
                initialValues={aiFormData} // <--- ВАЖЛИВО
            />
        </Box>
    );
};

export default DashboardPage;