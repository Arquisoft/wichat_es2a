import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CircularProgress, Box, Typography } from '@mui/material';
import GameHistoryTable from './GameHistoryTable';
import { useTheme } from '@mui/material/styles';

const apiEndpoint = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8000';

const GameHistoryUI = () => {
    const getUserId = () => {
        try {
            const userDataStr = window.localStorage.getItem('user');
            if (!userDataStr) return null;

            const userData = JSON.parse(userDataStr);
            const parsedToken = userData?.token;

            if (parsedToken) {
                const decoded = JSON.parse(atob(parsedToken.split('.')[1]));
                return decoded?.userId || null;
            }

            return null;
        } catch (error) {
            console.error("Error al recuperar userId:", error);
            return null;
        }
    };
    const theme = useTheme();
    const userId = getUserId();
    const [gameHistory, setGameHistory] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
                <Typography variant="h4" gutterBottom>Historial de Partidas</Typography>
                <Typography color="textSecondary">No hay partidas registradas aún.</Typography>
            </Box>
        );
    }

    return <GameHistoryTable gameHistory={gameHistory} theme={theme} />;
};

export default GameHistoryUI;