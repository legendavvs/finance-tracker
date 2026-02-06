import { Paper, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles'; // 1. Імпортуємо хук теми
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ChartSection = ({ data }) => {
    const theme = useTheme(); // 2. Отримуємо доступ до палітри кольорів

    // Заглушка, якщо даних немає
    if (!data || data.length === 0) {
        return (
            <Paper sx={{ 
                p: 3, 
                height: 450, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                bgcolor: 'background.paper', 
                borderRadius: 3, 
                // 3. Робимо рамку динамічною (сіра у світлій темі, ледь помітна у темній)
                border: `1px solid ${theme.palette.divider}` 
            }}>
                <Typography color="text.secondary">Додайте витрати, щоб побачити аналітику 📉</Typography>
            </Paper>
        );
    }

    // Обчислюємо загальну суму
    const total = data.reduce((acc, item) => acc + item.value, 0);

    return (
        <Paper sx={{
            p: 3,
            height: 450,
            bgcolor: 'background.paper',
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`, // Динамічна рамка
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                Витрати за категоріями
            </Typography>

            <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%" 
                            cy="45%" 
                            innerRadius={80}
                            outerRadius={115}
                            paddingAngle={4}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} style={{ outline: 'none' }} />
                            ))}
                        </Pie>

                        {/* 4. ТУЛТІП (Спливаюче вікно): Адаптуємо фон і текст */}
                        <Tooltip
                            contentStyle={{ 
                                backgroundColor: theme.palette.background.paper, // Фон як у картки
                                borderRadius: '12px', 
                                border: `1px solid ${theme.palette.divider}`,
                                boxShadow: theme.shadows[3], // Тінь з MUI
                                color: theme.palette.text.primary 
                            }}
                            itemStyle={{ 
                                color: theme.palette.text.primary, // Текст чорний або білий
                                fontWeight: 500 
                            }}
                            formatter={(value) => `${value.toLocaleString()} ₴`}
                            cursor={false}
                        />

                        {/* 5. ЛЕГЕНДА: Текст тепер змінює колір */}
                        <Legend
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                            wrapperStyle={{ paddingTop: '10px', fontSize: '14px', fontWeight: 500 }}
                            formatter={(value, entry) => {
                                const percent = ((entry.payload.value / total) * 100).toFixed(0);
                                return (
                                    <span style={{ 
                                        // ОСЬ ТУТ: беремо основний колір тексту з теми
                                        color: theme.palette.text.primary, 
                                        margin: '0 10px' 
                                    }}>
                                        {value} ({percent}%)
                                    </span>
                                );
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};

export default ChartSection;