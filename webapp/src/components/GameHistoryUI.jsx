import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { AuthContext } from './context/AuthContext';

const GameHistoryUI = () => {
    const [history, setHistory] = useState([]);
    const { userId } = useContext(AuthContext);

    useEffect(() => {
        if (userId) {
            fetch(`http://localhost:3001/api/game/statistics?userId=${userId}`)
                .then(response => response.json())
                .then(data => setHistory(data))
                .catch(error => console.error('Error fetching game history:', error));
        }
    }, [userId]);

    return (
        <Box sx={{ padding: 4 }}>
            <Typography variant="h4" gutterBottom>
                Game History
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell align="right">Correct Answers</TableCell>
                            <TableCell align="right">Wrong Answers</TableCell>
                            <TableCell align="right">Duration (seconds)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {history.map((game, index) => (
                            <TableRow key={index}>
                                <TableCell>{game.createdAt}</TableCell>
                                <TableCell align="right">{game.correct}</TableCell>
                                <TableCell align="right">{game.wrong}</TableCell>
                                <TableCell align="right">{game.duration}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default GameHistoryUI;