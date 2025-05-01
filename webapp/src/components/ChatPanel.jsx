import React, { useState, useRef, useEffect } from 'react';
import { Box, Grid, Paper, Typography, TextField, IconButton, CircularProgress, Snackbar, Alert } from '@mui/material';
import { Send, Close } from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import defaultTheme from './config/default-Theme.json';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Gateway service URL
const GATEWAY_URL = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8000';

const theme = createTheme(defaultTheme);

const ChatPanel = ({ setShowChat, correctAnswer, category }) => {
    const [messages, setMessages] = useState([
        { text: '¡Hola! ¿Cómo puedo ayudarte?', sender: 'bot' },
    ]);
    const [input, setInput] = useState('');
    const chatEndRef = useRef(null);
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [tokenFetchAttempted, setTokenFetchAttempted] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
    const previousAnswerRef = useRef(correctAnswer);


    const getUserId = () => {
        try {
            const userDataStr = window.localStorage.getItem('user');
            if (!userDataStr) {
                return null;
            }
            
            const userData = JSON.parse(userDataStr);
            const parsedToken = userData?.token;
            
            if (parsedToken) {
                const decoded = jwtDecode(userData.token);
                const decodedUserId = decoded?.userId;
                if (decodedUserId) {
                    return decodedUserId;
                }
            }
            
            return null;
        } catch (error) {
            //console.error("Error al recuperar userId:", error);
            return null;
        }
    };

    const clearConversationHistory = async (currentUserId) => {
        if (!currentUserId) return false;
        
        try {
            setIsLoading(true);
            
            await axios.delete(`${GATEWAY_URL}/conversations/${currentUserId}?preservePrePrompt=false`);
            
            return true;
        } catch (error) {
            //console.error("Error al eliminar el historial de conversación:", error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const currentUserId = getUserId();
        if (currentUserId) {
            setUserId(currentUserId);
        }
        setTokenFetchAttempted(true);
    }, []);

    useEffect(() => {
        if (previousAnswerRef.current === correctAnswer) {
            return;
        }
        
        const resetChat = async () => {
            const currentUserId = userId || getUserId();
            
            if (currentUserId) {
                const success = await clearConversationHistory(currentUserId);
                
                setMessages([
                    { text: `¡Hola! ¿Cómo puedo ayudarte?`, sender: 'bot' },
                ]);
                
                if (success) {
                    setNotification({
                        open: true,
                        message: "Conversación anterior eliminada. Iniciando nueva conversación.",
                        severity: "info"
                    });
                }
            } else {
                setNotification({
                    open: true,
                    message: "No se pudo identificar el usuario para limpiar la conversación anterior.",
                    severity: "warning"
                });
            }
        };
        
        resetChat();
        previousAnswerRef.current = correctAnswer;
    }, [correctAnswer, userId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (input.trim() === '' || isLoading) return;

        let currentUserId = userId;
        if (!currentUserId) {
            currentUserId = getUserId();
            
            if (currentUserId) {
                setUserId(currentUserId);
            } else {
                setMessages((prevMessages) => [
                    ...prevMessages, 
                    { text: input, sender: 'user' },
                    { text: "Error: No se pudo identificar al usuario. Por favor, inicia sesión de nuevo.", sender: 'bot' }
                ]);
                setInput('');
                return;
            }
        }

        const userMessage = { text: input, sender: 'user' };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput('');
        setIsLoading(true);        try {            
            // Mapear categorías específicas para asegurar que coincidan con las esperadas por el backend
            let mappedCategory = category;
            
            // Mapa de categorías de frontend a backend
            const categoryMap = {
                "Deportistas Españoles": "DeportistasEspañoles",
                "Lugares": "Lugares",
                "Futbolistas": "Futbolistas",
                "Arte": "Arte",
                "Pintores": "Pintores",
                "Cantantes": "Cantantes",
                "Filosofos": "Filosofos",
                "Actores": "Actores",
                "Científicos": "Científicos",
                "Banderas": "Banderas"
            };
            
            // Usa el mapa para obtener la categoría correcta del backend
            if (categoryMap[category]) {
                mappedCategory = categoryMap[category];
            }            const payload = {
                question: input,
                model: 'gemini',
                userId: currentUserId,
                useHistory: true,
                answer: correctAnswer,
                category: mappedCategory, // Usar la categoría mapeada para el backend
                language: 'es' // Utilizamos español por defecto, puedes cambiarlo si es necesario
            };
            const response = await axios.post(`${GATEWAY_URL}/askllm`, payload);
            const llmResponse = { text: response.data.answer, sender: 'bot' };
            setMessages((prevMessages) => [...prevMessages, llmResponse]);
        } catch (error) {
            //console.error('Error al enviar la pregunta al LLM:', error);
            let errorMessage = "Error al obtener la respuesta";
            if (error.response) {
                errorMessage += `: ${error.response.data.error || error.response.statusText}`;
            }
            setMessages((prevMessages) => [...prevMessages, {text: errorMessage, sender: 'bot'}]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseChat = () => {
        setShowChat(false);
    };

    const handleCloseNotification = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setNotification({ ...notification, open: false });
    };

    if (!tokenFetchAttempted) {
        return (
            <ThemeProvider theme={theme}>
                <Grid container sx={{ height: '100vh' }}>
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <CircularProgress />
                        <Typography variant="h6" sx={{ ml: 2 }}>Cargando chat...</Typography>
                    </Grid>
                </Grid>
            </ThemeProvider>
        );
    }


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
                                aria-label="Cerrar"
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
                                position: 'relative',
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
                                disabled={isLoading}
                            />
                            <IconButton
                                color="primary"
                                onClick={handleSendMessage}
                                sx={{ marginLeft: '8px' }}
                                disabled={isLoading}
                            >
                                {isLoading ? <CircularProgress size={24} /> : <Send />}
                            </IconButton>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
            
            {/* Notificación para informar sobre el estado del reset del chat */}
            <Snackbar 
                open={notification.open} 
                autoHideDuration={4000} 
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseNotification} 
                    severity={notification.severity}
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </ThemeProvider>
    );
};

export default ChatPanel;

