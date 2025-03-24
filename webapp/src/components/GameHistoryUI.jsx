import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';

const GameHistoryUI = ({ userId }) => {
    const [gameHistory, setGameHistory] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGameHistory = async () => {
            try {
                const response = await axios.get(`/game/statistics`, {
                    params: { userId }
                });
                setGameHistory(response.data);
            } catch (err) {
                setError("Failed to fetch game history. Please try again later.");
            }
        };

        if (userId) {
            fetchGameHistory();
        }
    }, [userId]);

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    if (!error && gameHistory.length === 0) {
        return <Typography>No hay datos disponibles en el historial de juegos.</Typography>;
    }

    return (
        <TableContainer component={Paper}>
            <Typography variant="h6" gutterBottom>
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