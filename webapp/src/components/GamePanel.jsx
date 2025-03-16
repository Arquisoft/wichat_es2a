import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, Button, IconButton } from '@mui/material';
import { MessageCircle } from 'lucide-react';
import ChatPanel from './ChatPanel';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import defaultTheme from './config/default-Theme.json';
import GameImage from '../media/madrid_mobile.webp';
import { Close } from '@mui/icons-material';
import Nav from './Nav';

const theme = createTheme(defaultTheme);

const handleAnswerClick = (answer) => {
    // La función que sea necesaria para manejar la respuesta
    alert(`Has seleccionado la respuesta: ${answer}`);
};

const GamePanel = () => {
    const [showChat, setShowChat] = useState(false); // Estado para mostrar/ocultar el chat

    const handleAnswerClick = (answer) => {
        console.log('Respuesta seleccionada:', answer);
    };

    return (
        <ThemeProvider theme={theme}>
            <Grid container style={{ height: '100vh', overflow: 'hidden' }}>
                <Nav />

                {/* Espacio entre Nav y el contenido */}
                <Grid item xs={12} style={{ height: '20px' }} />

                {/* Parte izquierda - Panel del juego */}
                <Grid
                    item
                    xs={showChat ? 8 : 12}
                    sm={showChat ? 8 : 12}
                    md={showChat ? 9 : 12}
                    lg={showChat ? 9 : 12}
                    style={{
                        transition: 'transform 0.5s',
                        width: showChat ? 'calc(100% - 300px)' : '100%',
                        height: '100vh',
                        overflow: 'hidden',
                        position: 'relative',
                    }}
                >
                    <Paper elevation={3} style={{ padding: '16px', height: '100%' }}>
                        <Typography variant="h4" align="center" gutterBottom>
                            Pregunta: ¿Cuál es la capital de España?
                        </Typography>
                        <Box
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                maxWidth: '100%',
                                maxHeight: '50%',
                                marginTop: '20px',
                                transform: showChat ? 'scale(0.8)' : 'scale(1)',
                                transition: 'transform 0.5s',
                            }}
                        >
                            <Box
                                component="img"
                                src={GameImage}
                                alt="Imagen del juego"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    aspectRatio: '1',
                                    objectFit: 'cover',
                                }}
                            />
                        </Box>

                        {/* Botones de respuestas */}
                        <Grid
                            container
                            spacing={2}
                            justifyContent="center"
                            style={{
                                marginTop: '20px',
                                transform: showChat ? 'scale(0.8)' : 'scale(1)',
                                transition: 'transform 0.5s',
                            }}
                        >
                            {['Respuesta 1', 'Respuesta 2', 'Respuesta 3', 'Respuesta 4'].map((respuesta, index) => (
                                <Grid item xs={6} sm={6} md={6} key={index}>
                                    <Button
                                        variant="contained"
                                        onClick={() => handleAnswerClick(respuesta)}
                                        fullWidth
                                        style={{
                                            padding: '10px',
                                            fontSize: '0.9rem',
                                            textAlign: 'center',
                                        }}
                                    >
                                        {respuesta}
                                    </Button>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>

                {/* Parte derecha - Panel del chat */}
                {showChat && (
                    <Grid
                        item
                        xs={12}
                        sm={5}
                        md={4}
                        lg={4}
                        xl={3}
                        style={{
                            height: '100vh',
                            backgroundColor: theme.palette.primary.main,
                            padding: '16px',
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: showChat ? '40%' : '0%',
                            maxWidth: '500px',
                            transition: 'width 0.5s ease-out',
                            overflowY: 'auto',
                        }}
                    >
                        <ChatPanel setShowChat={setShowChat} />
                    </Grid>
                )}

                {/* Botón flotante MessageCircle en la esquina inferior derecha */}
                {!showChat && (
                    <Button
                        variant="contained"
                        onClick={() => setShowChat(!showChat)}
                        style={{
                            position: 'absolute',
                            bottom: '20px',
                            right: '20px',
                            borderRadius: '50%',
                            padding: '16px',
                            backgroundColor: theme.palette.primary.main,
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <MessageCircle size={32} color="white" />
                    </Button>
                )}
            </Grid>
        </ThemeProvider>
    );
};

export default GamePanel;
