import { useState, useRef } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Mic, Stop } from '@mui/icons-material';

const VoiceInput = ({ onResult, disabled }) => {
    const [isListening, setIsListening] = useState(false);
    
    // Зберігаємо посилання на об'єкти, щоб вони не губилися між рендерами
    const recognitionRef = useRef(null);
    const silenceTimerRef = useRef(null);

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
        }
        setIsListening(false);
    };

    const handleVoiceClick = () => {
        // Якщо вже слухаємо — зупиняємо
        if (isListening) {
            stopRecording();
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Ваш браузер не підтримує розпізнавання голосу. Спробуйте Chrome.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'uk-UA';
        
        // 👇 ГОЛОВНА ЗМІНА: true дозволяє робити паузи і не вимикатися одразу
        recognition.continuous = true; 
        recognition.interimResults = true; // Дозволяє отримувати проміжні результати

        recognition.onstart = () => setIsListening(true);

        recognition.onresult = (event) => {
            // Щоразу, коли ми чуємо голос — скидаємо таймер тиші
            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
            }

            // Збираємо весь текст, що почули
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }

            // Якщо є фінальний текст — відправляємо його
            // (Але не зупиняємо запис, чекаємо ще, раптом користувач продовжить)
            if (finalTranscript) {
                onResult(finalTranscript);
                
                // 👇 АВТО-СТОП: Якщо 2 секунди тиші після фрази — зупиняємось
                silenceTimerRef.current = setTimeout(() => {
                    stopRecording();
                }, 2500); 
            }
        };

        recognition.onerror = (event) => {
            if (event.error !== 'aborted') {
                console.error("Voice error:", event.error);
            }
            stopRecording();
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    return (
        <Tooltip title={isListening ? "Натисни, щоб зупинити (або помовчи 2 сек)" : "Натисни і скажи витрату"}>
            <IconButton
                color={isListening ? "error" : "primary"}
                onClick={handleVoiceClick}
                disabled={disabled}
                sx={{
                    bgcolor: isListening ? 'rgba(255,0,0,0.1)' : 'background.paper',
                    border: '1px solid',
                    borderColor: isListening ? 'error.main' : 'primary.main',
                    width: 50, height: 50,
                    ml: 1,
                    // Додаємо анімацію пульсації, коли слухаємо
                    animation: isListening ? 'pulse 1.5s infinite' : 'none',
                    '@keyframes pulse': {
                        '0%': { boxShadow: '0 0 0 0 rgba(255, 0, 0, 0.4)' },
                        '70%': { boxShadow: '0 0 0 10px rgba(255, 0, 0, 0)' },
                        '100%': { boxShadow: '0 0 0 0 rgba(255, 0, 0, 0)' },
                    },
                }}
            >
                {isListening ? <Stop /> : <Mic />}
            </IconButton>
        </Tooltip>
    );
};

export default VoiceInput;