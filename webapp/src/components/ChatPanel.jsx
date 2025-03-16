import React, { useState, useRef } from 'react';
import { Box, Grid, Paper, Typography, TextField, IconButton } from '@mui/material';
import { Send, Close } from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import defaultTheme from './config/default-Theme.json';

const theme = createTheme(defaultTheme);

const ChatPanel = ({ setShowChat }) => {
    const [messages, setMessages] = useState([
        { text: '¡Hola! ¿Cómo puedo ayudarte?', sender: 'bot' },
    ]);
    const [input, setInput] = useState('');
    const chatEndRef = useRef(null);

    const handleSendMessage = () => {
        if (input.trim() === '') return;

        setMessages([...messages, { text: input, sender: 'user' }]);
        setInput('');

        // Simulación de respuesta automática
        setTimeout(() => {
            setMessages((prev) => [...prev, { text: 'Mensaje recibido', sender: 'bot' }]);
        }, 1000);
    };

    const handleCloseChat = () => {
        setShowChat(false); // Cierra el chat
    };

    return (
        <ThemeProvider theme={theme}>
            <Grid container sx={{ height: '100vh' }}>
                <Grid item xs={12}>
                    <Paper
                        elevation={3}
                        sx={{
                            height: '100vh',
                            backgroundColor: theme.palette.primary.main,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {/* Título del chat */}
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '16px',
                            }}
                        >
                            <Typography
                                variant="h6"
                                align="center"
                                sx={{
                                    color: theme.palette.primary.contrastText,
                                }}
                            >
                                Chat
                            </Typography>
                            <IconButton
                                color="primary"
                                onClick={handleCloseChat}
                                sx={{
                                    color: theme.palette.primary.contrastText,
                                }}
                            >
                                <Close />
                            </IconButton>
                        </Box>

                        {/* Mensajes del chat */}
                        <Box
                            sx={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            {messages.map((message, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        backgroundColor: message.sender === 'user' ? '#DCF8C6' : '#ffffff',
                                        borderRadius: '12px',
                                        padding: '10px',
                                        margin: '5px 0',
                                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                                        alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                                        maxWidth: '70%',
                                    }}
                                >
                                    <Typography variant="body1">{message.text}</Typography>
                                </Box>
                            ))}
                            <div ref={chatEndRef} />
                        </Box>

                        {/* Campo de entrada y botón de enviar */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '16px',
                                backgroundColor: '#f1f1f1',
                            }}
                        >
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Escribe un mensaje..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                sx={{ backgroundColor: 'white', borderRadius: '8px' }}
                            />
                            <IconButton
                                color="primary"
                                onClick={handleSendMessage}
                                sx={{ marginLeft: '8px' }}
                            >
                                <Send />
                            </IconButton>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </ThemeProvider>
    );
};

export default ChatPanel;

