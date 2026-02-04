import { Paper, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ChartSection = ({ data }) => {
    // Заглушка, якщо даних немає
    if (!data || data.length === 0) {
        return (
            <Paper sx={{ p: 3, height: 450, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.paper', borderRadius: 3, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <Typography color="text.secondary">Додайте витрати, щоб побачити аналітику 📉</Typography>
            </Paper>
        );
    }

    // Обчислюємо загальну суму
    const total = data.reduce((acc, item) => acc + item.value, 0);

    return (
        <Paper sx={{
            p: 3,
            height: 450, // Збільшили висоту контейнера
            bgcolor: 'background.paper',
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>Витрати за категоріями</Typography>

            <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%" // Центруємо по горизонталі
                            cy="45%" // Трохи піднімаємо вгору, щоб дати місце легенді знизу
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

                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: '#fff', fontWeight: 500 }}
                            formatter={(value) => `${value.toLocaleString()} ₴`}
                            cursor={false}
                        />

                        {/* ЛЕГЕНДА ЗНИЗУ */}
                        <Legend
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                            wrapperStyle={{ paddingTop: '10px', fontSize: '14px', fontWeight: 500 }}
                            formatter={(value, entry) => {
                                const percent = ((entry.payload.value / total) * 100).toFixed(0);
                                return <span style={{ color: '#F3F4F6', margin: '0 10px' }}>{value} ({percent}%)</span>;
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};

export default ChartSection;