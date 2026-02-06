import { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, CircularProgress, Avatar } from '@mui/material';
import { Send as SendIcon, AutoAwesome as AIIcon } from '@mui/icons-material';
import axios from '../utils/axios';
import { useTheme } from '@mui/material/styles';

const AIChatWidget = () => {
    const theme = useTheme();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Привіт! Я твій AI-помічник. Спитай мене, як зекономити гроші! 🤖' }
    ]);
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input;
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setInput('');
        setLoading(true);

        try {
            const { data } = await axios.post('/chat', { message: userMessage });
            setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', text: 'Ой, щось пішло не так. Спробуй ще раз.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AIIcon color="warning" />
                <Typography variant="h6" fontWeight="bold">AI Порадник</Typography>
            </Box>

            {/* Вікно повідомлень */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, maxHeight: '300px', display: 'flex', flexDirection: 'column', gap: 1 }}>
                {messages.map((msg, index) => (
                    <Box key={index} sx={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',

                        // 2. ФОН: Для юзера - синій. Для AI: у темній темі - сірий прозорий, у світлій - світло-сірий (#f0f0f0)
                        bgcolor: msg.role === 'user'
                            ? 'primary.main'
                            : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f0f0f0'),

                        // 3. ТЕКСТ: Для юзера - білий. Для AI - беремо "text.primary" (він сам стане чорним у світлій темі)
                        color: msg.role === 'user' ? 'white' : 'text.primary',

                        p: 1.5,
                        borderRadius: 2,
                        maxWidth: '80%'
                    }}>
                        <Typography variant="body2">{msg.text}</Typography>
                    </Box>
                ))}
                {loading && <CircularProgress size={20} sx={{ alignSelf: 'flex-start', ml: 2 }} />}
            </Box>

            {/* Поле вводу */}
            <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Спитайте щось..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button variant="contained" onClick={handleSend} disabled={loading}>
                    <SendIcon />
                </Button>
            </Box>
        </Paper>
    );
};

export default AIChatWidget;