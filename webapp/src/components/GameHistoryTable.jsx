import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
} from '@mui/material';
import { CheckCircle, Cancel, AccessTime, Event } from '@mui/icons-material';
import { createTheme } from '@mui/material/styles';

const defaultTheme = createTheme({
    palette: {
        primary: { main: '#1976d2' },
    },
});

const GameHistoryTable = ({ gameHistory = [], theme }) => {
    const usedTheme = theme || defaultTheme;
    return (
        <TableContainer component={Paper} style={{ margin: '16px auto', maxWidth: '80%', background: '#1C5E75', borderRadius: '12px', overflow: 'hidden' }}>
            <Typography variant="h4" align="center" gutterBottom style={{ padding: '16px 0', background: usedTheme.palette.primary.main, color: '#fff' }}>
                Historial de Partidas
            </Typography>
            <Table>
                <TableHead>
                    <TableRow style={{ background: usedTheme.palette.primary.main }}>
                        <TableCell align="center" style={{ fontWeight: 'bold', color: '#fff', fontSize: '1.2rem', verticalAlign: 'middle' }}>
                            Preguntas totales
                        </TableCell>
                        <TableCell align="center" style={{ fontWeight: 'bold', color: '#fff', fontSize: '1.2rem', verticalAlign: 'middle' }}>
                            Preguntas respondidas
                        </TableCell>
                        <TableCell align="center" style={{ fontWeight: 'bold', color: '#fff', fontSize: '1.2rem', verticalAlign: 'middle' }}>
                            Categoria
                        </TableCell>
                        <TableCell align="center" style={{ fontWeight: 'bold', color: '#fff', fontSize: '1.2rem', verticalAlign: 'middle' }}>
                            Nivel
                        </TableCell>
                        <TableCell align="center" style={{ fontWeight: 'bold', color: '#fff', fontSize: '1.2rem', verticalAlign: 'middle' }}>
                            <CheckCircle color="success" style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Correctas
                        </TableCell>
                        <TableCell align="center" style={{ fontWeight: 'bold', color: '#fff', fontSize: '1.2rem', verticalAlign: 'middle' }}>
                            <Cancel color="error" style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Erróneas
                        </TableCell>
                        <TableCell align="center" style={{ fontWeight: 'bold', color: '#fff', fontSize: '1.2rem', verticalAlign: 'middle' }}>
                            Puntuacion
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
                    {gameHistory.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={9} align="center" style={{ fontSize: '1.1rem', color: '#000' }}>
                                No hay partidas registradas aún.
                            </TableCell>
                        </TableRow>
                    ) : (
                        gameHistory.map((game, index) => (
                            <TableRow key={index} style={{ backgroundColor: index % 2 === 0 ? '#e3f2fd' : '#bbdefb' }}>
                                <TableCell align="center" style={{ fontSize: '1.1rem', color: '#000' }}>{game.totalQuestions ?? ''}</TableCell>
                                <TableCell align="center" style={{ fontSize: '1.1rem', color: '#000' }}>{game.answered ?? ''}</TableCell>
                                <TableCell align="center" style={{ fontSize: '1.1rem', color: '#000' }}>{game.category ?? ''}</TableCell>
                                <TableCell align="center" style={{ fontSize: '1.1rem', color: '#000' }}>{game.level ?? ''}</TableCell>
                                <TableCell align="center" style={{ fontSize: '1.1rem', color: '#000' }}>{game.correct ?? ''}</TableCell>
                                <TableCell align="center" style={{ fontSize: '1.1rem', color: '#000' }}>{game.wrong ?? ''}</TableCell>
                                <TableCell align="center" style={{ fontSize: '1.1rem', color: '#000' }}>{game.points ?? ''}</TableCell>
                                <TableCell align="center" style={{ fontSize: '1.1rem', color: '#000' }}>{game.duration ?? ''}</TableCell>
                                <TableCell align="center" style={{ fontSize: '1.1rem', color: '#000' }}>{game.createdAt ?? ''}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default GameHistoryTable;
