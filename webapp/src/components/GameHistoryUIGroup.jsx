import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CircularProgress, Box, Typography, Button } from '@mui/material';
import GameHistoryTable from './GameHistoryTable';
import { useTheme } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';

const apiEndpoint = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8000';

const GameHistoryUIGroup = () => {
    const { username } = useParams();
    const theme = useTheme();
    const navigate = useNavigate();
    const [gameHistory, setGameHistory] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                if (!username) {
                    throw new Error('Username is missing in the URL');
                }

                const response = await axios.get(`${apiEndpoint}/getUserId`, { params: { username } });
                if (response.data && response.data.userId) {
                    setUserId(response.data.userId);
                } else {
                    throw new Error('User ID not found in response');
                }
            } catch (err) {
                console.error("Error fetching user ID:", err);
                setError("No se pudo obtener el ID del usuario. Inténtalo más tarde.");
                setLoading(false);
            }
        };
        fetchUserId();
    }, [username]);

    useEffect(() => {
        if (!userId) return;

        const fetchGameHistory = async () => {
            try {
                const response = await axios.get(`${apiEndpoint}/game/statistics`, { params: { userId } });
                if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                    setGameHistory(response.data);
                } else {
                    setGameHistory([]); 
                }
            } catch (err) {
                setError("No se pudo cargar el historial de partidas. Inténtalo más tarde.");
            } finally {
                setLoading(false);
            }
        };
        fetchGameHistory();
    }, [userId]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
                <Typography variant="h6" style={{ marginLeft: '16px' }}>Cargando historial de partidas...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Typography color="error" variant="h6">{error}</Typography>
            </Box>
        );
    }

    if (!Array.isArray(gameHistory) || gameHistory.length === 0) {
        return (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100vh">
                <Typography variant="h5" gutterBottom>Historial de Partidas</Typography>
                <Typography color="textSecondary">No hay partidas registradas aún.</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(-1)}
                    sx={{
                        position: 'fixed',
                        bottom: '16px',
                        right: '16px',
                        zIndex: 1000,
                    }}
                >
                    Volver a Detalles del Grupo
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            <GameHistoryTable gameHistory={gameHistory} theme={theme} />

            <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(-1)}
                sx={{
                    position: 'fixed',
                    bottom: '16px',
                    right: '16px',
                    zIndex: 1000,
                }}
            >
                Volver a Detalles del Grupo
            </Button>
        </Box>
    );
};

export default GameHistoryUIGroup;