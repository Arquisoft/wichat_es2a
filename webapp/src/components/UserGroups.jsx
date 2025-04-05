import React, { useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Typography, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Box, CircularProgress, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Group, Add, PersonAdd } from '@mui/icons-material';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const UserGroups = () => {
    const [groups, setGroups] = useState([]);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [joinDialogOpen, setJoinDialogOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [joinGroupName, setJoinGroupName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();
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
    const userId = getUserId();

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const username = JSON.parse(localStorage.getItem('user'))?.username;
            if (!username) {
                setError('Usuario no autenticado');
                setLoading(false);
                return;
            }

            const response = await axios.get(`http://localhost:8004/listGroups`, {
                params: { userId }
            });
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                setGroups(response.data);
            } else {
                setGroups([]); 
            }
        } catch (err) {
            console.error('Error al cargar los grupos:', err);
        } finally { 
            setLoading(false);
        }
    };

    const handleCreateGroup = async () => {
        try {
            await axios.post('http://localhost:8004/createGroup', {
                groupName: newGroupName,
                userId
            });
            setCreateDialogOpen(false);
            setNewGroupName('');
            setSuccessMessage('Grupo creado exitosamente');
            fetchGroups();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al crear el grupo');
        }
    };

    const handleJoinGroup = async () => {
        try {
            const username = JSON.parse(localStorage.getItem('user'))?.username;
            await axios.post('http://localhost:8004/addUserToGroup', {
                username,
                groupName: joinGroupName
            });
            setJoinDialogOpen(false);
            setJoinGroupName('');
            setSuccessMessage('Te has unido al grupo exitosamente');
            fetchGroups();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al unirse al grupo');
        }
    };

    const handleGroupClick = (groupName) => {
        navigate(`/groups/${groupName}`);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
                <Typography variant="h6" style={{ marginLeft: '16px' }}>Cargando grupos...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            
            {successMessage && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
                    {successMessage}
                </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    <Group sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Mis Grupos
                </Typography>
                <Box>
                    <Button 
                        variant="contained" 
                        startIcon={<Add />}
                        onClick={() => setCreateDialogOpen(true)}
                        sx={{ mr: 2 }}
                    >
                        Crear Grupo
                    </Button>
                    <Button 
                        variant="contained"
                        startIcon={<PersonAdd />}
                        onClick={() => setJoinDialogOpen(true)}
                    >
                        Unirse a Grupo
                    </Button>
                </Box>
            </Box>

            {groups.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="textSecondary">
                        No perteneces a ningún grupo. ¡Crea uno nuevo o únete a uno existente!
                    </Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: 'primary.main' }}>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre del Grupo</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tu Rol</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {groups.map((group, index) => (
                                <TableRow 
                                    key={group._id}
                                    onClick={() => handleGroupClick(group.groupName)}
                                    sx={{ 
                                        cursor: 'pointer',
                                        '&:hover': { backgroundColor: 'action.hover' },
                                        backgroundColor: index % 2 === 0 ? 'background.paper' : 'action.hover'
                                    }}
                                >
                                    <TableCell>{group.groupName}</TableCell>
                                    <TableCell>{group.role.charAt(0).toUpperCase() + group.role.slice(1)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Dialog para crear grupo */}
            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
                <DialogTitle>Crear Nuevo Grupo</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Nombre del Grupo"
                        fullWidth
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleCreateGroup} variant="contained" disabled={!newGroupName}>
                        Crear
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog para unirse a grupo */}
            <Dialog open={joinDialogOpen} onClose={() => setJoinDialogOpen(false)}>
                <DialogTitle>Unirse a un Grupo</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Nombre del Grupo"
                        fullWidth
                        value={joinGroupName}
                        onChange={(e) => setJoinGroupName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setJoinDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleJoinGroup} variant="contained" disabled={!joinGroupName}>
                        Unirse
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserGroups;