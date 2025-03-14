import React from 'react';
import { Box, Grid, Paper, Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import defaultTheme from "./config/default-Theme.json";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import GameImage from '../media/madrid_mobile.webp';
import { DisplaySettings } from '@mui/icons-material';

const theme = createTheme(defaultTheme);

// Simulación de mensajes de chat
const chatMessages = Array.from({ length: 100 }, (_, index) => `Mensaje ${index + 1}`);

const ChatPanel = () => {

    return (
        <ThemeProvider theme={theme}>
        <Grid container>
            <Grid>
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

export default ChatPanel;