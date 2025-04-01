import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Avatar, Button,
    Paper, Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import defaultTheme from "./config/default-Theme.json";
import { useTranslation } from 'react-i18next';
import "../i18n";

ChartJS.register(ArcElement, Tooltip, Legend);

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

const theme = createTheme(defaultTheme);

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        username: '',
    });
    const [gameHistory, setGameHistory] = useState(null);
    const [error, setError] = useState(null);
    const { t } = useTranslation();

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
            console.error("Error al recuperar userId:", error);
            return null;
        }
    };

    const userId = getUserId();

    // Obtenemos las estadisticas del usuario
    useEffect(() => {
        const fetchUserStats = async () => {
            if (userId) {
                try {
                    const response = await fetch(`${apiEndpoint}/game/statistics?userId=${userId}`);
                    const data = await response.json();
                    setGameHistory(data);
                } catch (error) {
                    setError("Error al cargar las estadísticas del usuario.");
                }
            }
        };

        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) {
            setUser(userData);
            fetchUserStats();
        } else {
            navigate('/login');
        }
    }, [navigate, userId, t]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Datos para el gráfico de estadísticas
    const correctAnswers = (gameHistory && Array.isArray(gameHistory))
        ? gameHistory.reduce((total, game) => total + game.correct, 0)
        : 0;

    const wrongAnswers = (gameHistory && Array.isArray(gameHistory))
        ? gameHistory.reduce((total, game) => total + game.wrong, 0)
        : 0;

    const data = {
        labels: [t('profile.correctAnswer'), t('profile.wrongAnswer')],
        datasets: [
            {
                label: t('profile.gameStatics'),
                data: [correctAnswers, wrongAnswers],
                backgroundColor: [
                    theme.palette.green.main,
                    theme.palette.red.main

                ],
                hoverBackgroundColor: [
                    theme.palette.green.dark,
                    theme.palette.red.dark
                ],
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            }
        },
        maintainAspectRatio: false,
    }

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="xl">
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h4" sx={{ mt: 2 }}>
                        {t('profile.welcomeUser', {user: user.username || t('profile.user')})}
                    </Typography>
                </Box>

                <Grid container spacing={4} sx={{ padding: 2 }}>

                    {/* Columna izquierda: Gráfico de estadísticas */}
                    <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box sx={{ mt: 4, width: '100%' }}>
                            <Typography variant="h6" gutterBottom align="center">
                                {t('profile.responseStatics')}
                            </Typography>

                            <Paper sx={{ padding: 2, width: '100%', display: 'flex', justifyContent: 'center' }}>
                                {!gameHistory || gameHistory.length === 0 ? (
                                    <Typography variant="body1" color="textSecondary">
                                        {t('profile.noStaticsAvailable')}
                                    </Typography>
                                ) : (
                                    <Pie data={data} options={options} height={250}></Pie>
                                )}
                            </Paper>
                        </Box>
                    </Grid>

                    {/* Columna derecha: Información del usuario */}
                    <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box sx={{ textAlign: 'center', mt: 4 }}>
                            <Avatar sx={{ width: 120, height: 120, margin: 'auto' }} src={user.avatar} />
                            <Typography variant="body1" sx={{ mt: 1 }}>
                                {t('profile.editProfileInfo')}
                            </Typography>

                            <Box sx={{ mt: 3 }}>
                                <Button variant="contained" color="primary" onClick={() => navigate('/edit-profile')}>
                                    {t('profile.editProfile')}
                                </Button>
                            </Box>

                            <Box sx={{ mt: 2 }}>
                                <Button variant="outlined" color="error" onClick={handleLogout}>
                                    {t('profile.logout')}
                                </Button>
                            </Box>
                        </Box>

                        {error && <Typography color="error" align="center">{error}</Typography>}

                    </Grid>
                </Grid>
            </Container>
        </ThemeProvider>
    );
};

export default ProfilePage;
