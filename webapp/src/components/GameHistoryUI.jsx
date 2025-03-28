import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress } from '@mui/material';
import { jwtDecode } from 'jwt-decode';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

const GameHistoryUI = () => {
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
    const [gameHistory, setGameHistory] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchGameHistory = async () => {
            try {
                const response = await axios.get(`${apiEndpoint}/game/statistics`, { params: { userId } });
                setGameHistory(response.data);
            } catch (err) {
                setError("Failed to fetch game history. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchGameHistory();
    }, [userId]);

    if (loading) {
        return (
            <Typography variant="h6" align="center">
                <CircularProgress /> Loading game history...
            </Typography>
        );
    }

    if (error) {
        return <Typography color="error" align="center">{error}</Typography>;
    }

    if (!Array.isArray(gameHistory) || gameHistory.length === 0) {
        return (
            <TableContainer component={Paper}>
                <Typography variant="h6" gutterBottom align="center">
                    Game History
                </Typography>
                <Typography align="center" color="textSecondary" gutterBottom>
                    El historial está vacío debido a que no se ha jugado ninguna partida con este usuario.
                </Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Correct Answers</TableCell>
                            <TableCell>Wrong Answers</TableCell>
                            <TableCell>Duration (seconds)</TableCell>
                            <TableCell>Date</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={4} align="center">
                                No hay datos disponibles.
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        );    
    }

    return (
        <TableContainer component={Paper}>
            <Typography variant="h6" gutterBottom align="center">
                Game History
            </Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Correct Answers</TableCell>
                        <TableCell>Wrong Answers</TableCell>
                        <TableCell>Duration (seconds)</TableCell>
                        <TableCell>Date</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {gameHistory.map((game, index) => (
                        <TableRow key={index}>
                            <TableCell>{game.correct}</TableCell>
                            <TableCell>{game.wrong}</TableCell>
                            <TableCell>{game.duration}</TableCell>
                            <TableCell>{game.createdAt}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default GameHistoryUI;