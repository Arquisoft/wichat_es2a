import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    CircularProgress,
    Box,
} from '@mui/material';
import { CheckCircle, Cancel, AccessTime, Event } from '@mui/icons-material';
import { jwtDecode } from 'jwt-decode';
import { useTheme } from '@mui/material/styles';
import defaultTheme from "./config/default-Theme.json";

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
                <Typography variant="h5" gutterBottom>Historial de Partidas</Typography>
                <Typography color="textSecondary">No hay partidas registradas aún.</Typography>
            </Box>
        );
    }

    return (
        <TableContainer component={Paper} style={{ margin: '16px auto', maxWidth: '80%', background: '#1C5E75', borderRadius: '12px', overflow: 'hidden' }}>
            <Typography variant="h4" align="center" gutterBottom style={{ padding: '16px 0', background: theme.palette.primary.main, color: '#fff' }}>
                Historial de Partidas
            </Typography>
            <Table>
                <TableHead>
                    <TableRow style={{ background: theme.palette.primary.main }}>
                        <TableCell align="center" style={{ fontWeight: 'bold', color: '#fff', fontSize: '1.2rem', verticalAlign: 'middle' }}>
                            <CheckCircle color="success" style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Correctas
                        </TableCell>
                        <TableCell align="center" style={{ fontWeight: 'bold', color: '#fff', fontSize: '1.2rem', verticalAlign: 'middle' }}>
                            <Cancel color="error" style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Erróneas
                        </TableCell>
                        <TableCell align="center" style={{ fontWeight: 'bold', color: '#fff', fontSize: '1.2rem', verticalAlign: 'middle' }}>
                            <AccessTime style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Duración (segundos)
                        </TableCell>
                        <TableCell align="center" style={{ fontWeight: 'bold', color: '#fff', fontSize: '1.2rem', verticalAlign: 'middle' }}>
                            <Event style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Fecha
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {gameHistory.map((game, index) => (
                        <TableRow key={index} style={{ backgroundColor: index % 2 === 0 ? '#e3f2fd' : '#bbdefb' }}>
                            <TableCell align="center" style={{ fontSize: '1.1rem', color: '#000' }}>{game.correct}</TableCell>
                            <TableCell align="center" style={{ fontSize: '1.1rem', color: '#000' }}>{game.wrong}</TableCell>
                            <TableCell align="center" style={{ fontSize: '1.1rem', color: '#000' }}>{game.duration}</TableCell>
                            <TableCell align="center" style={{ fontSize: '1.1rem', color: '#000' }}>{new Date(game.createdAt).toLocaleString('es-ES')}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default GameHistoryUI;