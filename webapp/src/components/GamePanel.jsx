import React from 'react';
import { Box, Grid, Paper, Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import defaultTheme from "./config/default-Theme.json";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import GameImage from '../media/madrid_mobile.webp';
import { AspectRatio, DisplaySettings } from '@mui/icons-material';

const theme = createTheme(defaultTheme);

const handleAnswerClick = (answer) => {
    // La funcion que sea necesaria para manejar la respuesta
    alert(`Has seleccionado la respuesta: ${answer}`);
}


// Simulación de mensajes de chat
const chatMessages = Array.from({ length: 100 }, (_, index) => `Mensaje ${index + 1}`);


const GamePanel = () => {

    return (
        <ThemeProvider theme={theme}>
        <Grid container>

            {/* Parte izquierda - Panel del juego */}
            <Grid item xs={8}>
                <Paper elevation={3} style={{ padding: '16px', height: '100vh' }}>
                    <Typography variant="h4" align="center" gutterBottom>
                        Pregunta: ¿Cuál es la capital de España?
                    </Typography>
                    <Box style={{display: 'flex', justifyContent: 'center', maxWidth: '100%', maxHeight: '50%', marginTop: '20px'}}>
                    <Box
                        component="img"
                        src={GameImage}
                        alt="Imagen del juego"
                        style={{ maxWidth: '100%', maxHeight: '100%', AspectRatio:'1' }}
                    />
                    </Box>
                    <Grid container spacing={2} justifyContent="center" style={{ marginTop: '20px' }}>
                        <Grid item xs={6}>
                            <Button
                                variant="contained"
                                onClick={() => handleAnswerClick('Respuesta 1')}
                                fullWidth
                                style={{ padding: '20px', textAlign: 'center' }}
                            >
                                Respuesta 1
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button
                                variant="contained"
                                onClick={() => handleAnswerClick('Respuesta 2')}
                                fullWidth
                                style={{ padding: '20px', textAlign: 'center' }}
                            >
                                Respuesta 2
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button
                                variant="contained"
                                onClick={() => handleAnswerClick('Respuesta 3')}
                                fullWidth
                                style={{ padding: '20px', textAlign: 'center' }}
                            >
                                Respuesta 3
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button
                                variant="contained"
                                onClick={() => handleAnswerClick('Respuesta 4')}
                                fullWidth
                                style={{ padding: '20px', textAlign: 'center' }}
                            >
                                Respuesta 4
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>

                {/* Parte derecha - Panel del chat */}
                <Grid item xs={4}>
                    <Paper elevation={3} style={{ padding: '16px', height: '100vh', backgroundColor: theme.palette.primary.main }}>
                        <Typography variant="h6" align="center" gutterBottom style={{ color: theme.palette.primary.contrastText }}>
                            Chat
                        </Typography>
                        <Box
                            style={{
                                height: '80%',
                                marginTop: '10px',
                                overflowY: 'auto', // Habilitar el desplazamiento vertical
                            }}
                        >
                            {chatMessages.map((message, index) => (
                                <Box
                                    key={index}
                                    style={{
                                        backgroundColor: '#ffffff', // Color de fondo de los mensajes
                                        borderRadius: '8px', // Bordes redondeados
                                        padding: '10px',
                                        margin: '5px 0', // Espaciado entre mensajes
                                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', // Sombra sutil
                                        alignSelf: 'center',
                                    }}
                                >
                                    <Typography variant="body1" color="textPrimary">
                                        {message}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </ThemeProvider>
    );
};

export default GamePanel;