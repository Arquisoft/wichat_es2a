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

const ChatPanel = ({ setShowChat, correctAnswer }) => {
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

    // Función simplificada para obtener el userId del localStorage
    const getUserId = () => {
        try {
            // Obtenemos el objeto de usuario directamente del localStorage
            const userDataStr = window.localStorage.getItem('user');
            if (!userDataStr) {
                console.log("No se encontró información de usuario en localStorage");
                return null;
            }
            
            const userData = JSON.parse(userDataStr);
            const parsedToken = userData?.token;
            
            // Extraemos el userId del token decodificado
            if (parsedToken) {
                const decoded = jwtDecode(userData.token);
                const decodedUserId = decoded?.userId;
                if (decodedUserId) {
                    console.log("UserId obtenido correctamente:", decodedUserId);
                    return decodedUserId;
                }
            }
            
            console.log("No se pudo encontrar userId en los datos de usuario");
            return null;
        } catch (error) {
            console.error("Error al recuperar userId:", error);
            return null;
        }
    };

    // Función para limpiar el historial de conversaciones en el servidor
    const clearConversationHistory = async (currentUserId) => {
        if (!currentUserId) return false;
        
        try {
            setIsLoading(true);
            
            // Llamada al endpoint del gateway para borrar la conversación
            // El parámetro preservePrePrompt=false asegura que se elimine también el preprompt
            await axios.delete(`${GATEWAY_URL}/conversations/${currentUserId}?preservePrePrompt=false`);
            
            console.log("Historial de conversación eliminado correctamente");
            return true;
        } catch (error) {
            console.error("Error al eliminar el historial de conversación:", error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Efecto para inicializar el userId
    useEffect(() => {
        const currentUserId = getUserId();
        if (currentUserId) {
            setUserId(currentUserId);
        }
        setTokenFetchAttempted(true);
    }, []);

    // Efecto para detectar cambios en correctAnswer y resetear el chat
    useEffect(() => {
        // Si es la primera carga, solo guardar la referencia
        if (previousAnswerRef.current === correctAnswer) {
            return;
        }
        
        // Si ha cambiado la respuesta correcta, limpiar el chat
        const resetChat = async () => {
            const currentUserId = userId || getUserId();
            
            if (currentUserId) {
                // Limpiar conversación en la base de datos
                const success = await clearConversationHistory(currentUserId);
                
                // Resetear los mensajes locales
                setMessages([
                    { text: `¡Nueva pregunta! ¿Necesitas ayuda para adivinar ${correctAnswer}?`, sender: 'bot' },
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
        // Actualizar la referencia a la nueva respuesta
        previousAnswerRef.current = correctAnswer;
    }, [correctAnswer, userId]);

    // Scroll al final del chat cuando hay nuevos mensajes
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (input.trim() === '' || isLoading) return;

        // Intentamos obtener el userId si aún no está establecido
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
        setIsLoading(true);

        try {
            const payload = {
                question: input,
                model: 'gemini',
                userId: currentUserId,
                useHistory: true,
                answer: correctAnswer,
            };

            const response = await axios.post(`${GATEWAY_URL}/askllm`, payload);
            const llmResponse = { text: response.data.answer, sender: 'bot' };
            setMessages((prevMessages) => [...prevMessages, llmResponse]);
        } catch (error) {
            console.error('Error al enviar la pregunta al LLM:', error);
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

    // If we're still waiting for the token on first render
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

    // Chat UI remains the same
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
                                Chat {userId ? `(ID: ${userId.substring(0, 5)}...)` : '(No ID)'}
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

