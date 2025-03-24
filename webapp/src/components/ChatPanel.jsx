import React, { useState, useRef, useEffect } from 'react';
import { Box, Grid, Paper, Typography, TextField, IconButton, CircularProgress } from '@mui/material';
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

    // Function to extract userId from token
    const extractUserIdFromToken = (token) => {
        if (!token) {
            console.log("No token found in localStorage");
            return null;
        }
        
        try {
            console.log("Token found, attempting to decode");
            const decoded = jwtDecode(token);
            console.log("Decoded token:", decoded);
            
            if (!decoded) {
                console.log("Token decoded as null or undefined");
                return null;
            }
            
            const extractedUserId = decoded.userId || decoded.sub || decoded._id;
            console.log("Extracted userId:", extractedUserId);
            return extractedUserId;
        } catch (error) {
            console.error("Error decoding token:", error);
            return null;
        }
    };

    useEffect(() => {
        const initializeUserId = () => {
            console.log("Initializing userId");
            const storedToken = window.localStorage.getItem('token');
            console.log("Token from localStorage:", storedToken ? "Found (not showing for security)" : "Not found");
            
            const extractedUserId = extractUserIdFromToken(storedToken);
            
            if (extractedUserId) {
                console.log("Setting userId state to:", extractedUserId);
                setUserId(extractedUserId);
            } else {
                console.log("No valid userId could be extracted from token");
                // Try to find user information from other localStorage items
                try {
                    const userInfo = window.localStorage.getItem('userInfo');
                    if (userInfo) {
                        const parsedUserInfo = JSON.parse(userInfo);
                        if (parsedUserInfo && parsedUserInfo._id) {
                            console.log("Found userId in userInfo:", parsedUserInfo._id);
                            setUserId(parsedUserInfo._id);
                        }
                    }
                } catch (e) {
                    console.error("Error parsing userInfo:", e);
                }
            }
            
            setTokenFetchAttempted(true);
        };

        initializeUserId();
    }, []);

    // Scroll to bottom of chat when messages change
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (input.trim() === '' || isLoading) return;

        // Final attempt to get userId if it's still null
        let currentUserId = userId;
        if (!currentUserId) {
            console.log("userId is still null in handleSendMessage, making final attempt");
            const storedToken = window.localStorage.getItem('token');
            currentUserId = extractUserIdFromToken(storedToken);
            
            if (currentUserId) {
                console.log("Finally got userId:", currentUserId);
                setUserId(currentUserId);
            } else {
                console.error('No user ID available after multiple attempts');
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
            console.log("Sending request to LLM with userId:", currentUserId);
            
            const payload = {
                question: input,
                model: 'gemini',
                userId: currentUserId,
                useHistory: true,
                answer: correctAnswer,
            };
            
            console.log("Request payload:", payload);

            const response = await axios.post(`${GATEWAY_URL}/askllm`, payload);
            console.log("LLM response:", response.data);

            const llmResponse = { text: response.data.answer, sender: 'bot' };
            setMessages((prevMessages) => [...prevMessages, llmResponse]);
        } catch (error) {
            console.error('Error al enviar la pregunta al LLM:', error);
            // Show more detailed error information
            let errorMessage = "Error al obtener la respuesta";
            if (error.response) {
                errorMessage += `: ${error.response.data.error || error.response.statusText}`;
                console.log("Error response data:", error.response.data);
            }
            setMessages((prevMessages) => [...prevMessages, {text: errorMessage, sender: 'bot'}]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseChat = () => {
        setShowChat(false);
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
        </ThemeProvider>
    );
};

export default ChatPanel;

