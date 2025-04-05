import React, { useEffect, useState } from 'react';
import { 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Typography, Box, CircularProgress, List, ListItem,
    ListItemText, ListItemIcon, Collapse
} from '@mui/material';
import { Person, AdminPanelSettings, ExpandMore, ExpandLess, Groups, CheckCircle, Cancel, AccessTime, Event } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const GroupDetails = () => {
    const { groupName } = useParams();
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [gameHistory, setGameHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGroupUsers = async () => {
            try {
                const response = await axios.get(`http://localhost:8004/getGroupUsers`, {
                    params: { groupName }
                });
                setUsers(response.data.users);
                setLoading(false);
            } catch (err) {
                setError('Error al cargar los usuarios del grupo');
                setLoading(false);
            }
        };
        fetchGroupUsers();
    }, [groupName]);

    const fetchUserGameHistory = async (username) => {
        try {
            setGameHistory([]);
            const userResponse = await axios.get(`http://localhost:8001/user/${username}`);
            const userId = userResponse.data._id;
            const response = await axios.get(`http://localhost:8004/getUserGameHistory`, {
                params: { userId }
            });
            setGameHistory(response.data);
        } catch (err) {
            console.error('Error fetching game history:', err);
        }
    };

    const handleUserClick = (user) => {
        if (selectedUser === user.username) {
            setSelectedUser(null);
            setGameHistory([]);
        } else {
            setSelectedUser(user.username);
            fetchUserGameHistory(user.username);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
                <Typography variant="h6" style={{ marginLeft: '16px' }}>Cargando usuarios...</Typography>
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

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>
                <Groups sx={{ mr: 1, verticalAlign: 'middle' }} />
                Grupo: {groupName}
            </Typography>

            <List component={Paper} sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {users.map((user) => (
                    <React.Fragment key={user.username}>
                        <ListItem 
                            button 
                            onClick={() => handleUserClick(user)}
                            sx={{
                                '&:hover': { bgcolor: 'action.hover' }
                            }}
                        >
                            <ListItemIcon>
                                {user.role === 'admin' ? <AdminPanelSettings color="primary" /> : <Person />}
                            </ListItemIcon>
                            <ListItemText 
                                primary={user.username}
                                secondary={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            />
                            {selectedUser === user.username ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                        
                        <Collapse in={selectedUser === user.username} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 2 }}>
                                {gameHistory.length > 0 ? (
                                    <TableContainer component={Paper} sx={{ mt: 2 }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                                                    <TableCell align="center" sx={{ color: 'white' }}>
                                                        <CheckCircle sx={{ verticalAlign: 'middle', mr: 1 }} />
                                                        Correctas
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ color: 'white' }}>
                                                        <Cancel sx={{ verticalAlign: 'middle', mr: 1 }} />
                                                        Incorrectas
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ color: 'white' }}>
                                                        <AccessTime sx={{ verticalAlign: 'middle', mr: 1 }} />
                                                        Duración
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ color: 'white' }}>
                                                        <Event sx={{ verticalAlign: 'middle', mr: 1 }} />
                                                        Fecha
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {gameHistory.map((game, index) => (
                                                    <TableRow key={index} sx={{ 
                                                        backgroundColor: index % 2 === 0 ? '#e3f2fd' : '#bbdefb'
                                                    }}>
                                                        <TableCell align="center">{game.correct}</TableCell>
                                                        <TableCell align="center">{game.wrong}</TableCell>
                                                        <TableCell align="center">{game.duration}s</TableCell>
                                                        <TableCell align="center">
                                                            {new Date(game.createdAt).toLocaleString('es-ES')}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Typography color="textSecondary" sx={{ mt: 2, textAlign: 'center' }}>
                                        No hay partidas registradas para este usuario
                                    </Typography>
                                )}
                            </Box>
                        </Collapse>
                    </React.Fragment>
                ))}
            </List>
        </Box>
    );
};

export default GroupDetails;