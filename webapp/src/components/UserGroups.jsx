import React, { useState, useEffect } from 'react';
import {
    Paper, Typography, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Box, CircularProgress, Alert, Grid,
    Card, CardContent, CardActionArea, Zoom, Fade
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Group, Add, PersonAdd, AdminPanelSettings, Person, Groups } from '@mui/icons-material';
import axios from 'axios';
const apiEndpoint = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8000';

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
    });

    const fetchGroups = async () => {
        try {
            const username = JSON.parse(localStorage.getItem('user'))?.username;
            if (!username) {
                setError('Usuario no autenticado');
                setLoading(false);
                return;
            }

            const response = await axios.get(`${apiEndpoint}/group/listGroups`, {
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
            await axios.post(`${apiEndpoint}/group/createGroup`, {
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
            await axios.post(`${apiEndpoint}/group/addUserToGroup`, {
                groupName: joinGroupName,
                userId
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
        <Box sx={{ 
            p: 3,
            backgroundColor: '#fff',
            minHeight: '100vh'
        }}>
            <Fade in={error !== null}>
                <div>
                    {error && (
                        <Alert 
                            severity="error" 
                            sx={{ 
                                mb: 2,
                                borderRadius: 2,
                                boxShadow: 2
                            }} 
                            onClose={() => setError(null)}
                        >
                            {error}
                        </Alert>
                    )}
                </div>
            </Fade>
            
            <Fade in={successMessage !== ''}>
                <div>
                    {successMessage && (
                        <Alert 
                            severity="success" 
                            sx={{ 
                                mb: 2,
                                borderRadius: 2,
                                boxShadow: 2
                            }} 
                            onClose={() => setSuccessMessage('')}
                        >
                            {successMessage}
                        </Alert>
                    )}
                </div>
            </Fade>

            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 4,
                backgroundColor: '#e3f2fd',
                p: 4,
                borderRadius: 3,
                boxShadow: 3
            }}>
                <Typography variant="h4" sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    fontWeight: 'bold'
                }}>
                    <Groups sx={{ mr: 2, fontSize: 45, color: 'primary.main' }} />
                    Mis Grupos
                </Typography>
                <Box>
                    <Button 
                        variant="contained" 
                        startIcon={<Add sx={{ fontSize: 40 }} />}
                        onClick={() => setCreateDialogOpen(true)}
                        sx={{ 
                            mr: 2,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: '1.6rem',
                            py: 2,
                            px: 5,
                            boxShadow: 3,
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: 4
                            },
                            transition: 'all 0.2s'
                        }}
                    >
                        Crear Grupo
                    </Button>
                    <Button 
                        variant="contained"
                        startIcon={<PersonAdd sx={{ fontSize: 40 }} />}
                        onClick={() => setJoinDialogOpen(true)}
                        sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: '1.6rem',
                            py: 2,
                            px: 5,
                            boxShadow: 3,
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: 4
                            },
                            transition: 'all 0.2s'
                        }}
                    >
                        Unirse a Grupo
                    </Button>
                </Box>
            </Box>

            {groups.length === 0 ? (
                <Paper sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    borderRadius: 2,
                    backgroundColor: '#fff',
                    boxShadow: 2
                }}>
                    <Groups sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
                        No perteneces a ningún grupo
                    </Typography>
                    <Typography color="textSecondary">
                        ¡Crea uno nuevo o únete a uno existente!
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {groups.map((group, index) => (
                        <Grid item xs={12} sm={6} md={4} key={group._id}>
                            <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                                <Card sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderRadius: 2,
                                    boxShadow: 2,
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4
                                    },
                                    transition: 'all 0.2s'
                                }}>
                                    <CardActionArea 
                                        onClick={() => handleGroupClick(group.groupName)}
                                        sx={{ flexGrow: 1 }}
                                    >
                                        <CardContent sx={{ p: 4 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <Group sx={{ fontSize: 50, color: 'white', mr: 2 }} />
                                                <Typography variant="h5" sx={{ 
                                                    flexGrow: 1, 
                                                    color: 'white',
                                                    fontWeight: 'bold' 
                                                }}>
                                                    {group.groupName}
                                                </Typography>
                                                {group.role === 'admin' ? (
                                                    <AdminPanelSettings sx={{ color: 'white', fontSize: 35 }} />
                                                ) : (
                                                    <Person sx={{ color: 'white', fontSize: 35 }} />
                                                )}
                                            </Box>
                                            <Typography 
                                                variant="h6" 
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'flex-end',
                                                    color: 'rgba(255, 255, 255, 0.9)',
                                                    fontSize: '1.5rem',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {group.role.charAt(0).toUpperCase() + group.role.slice(1)}
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Zoom>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Dialog 
                open={createDialogOpen} 
                onClose={() => setCreateDialogOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: 24,
                        width: '100%',
                        maxWidth: 500
                    }
                }}
            >
                <DialogTitle sx={{ 
                    borderBottom: 1, 
                    borderColor: 'divider',
                    pb: 2,
                    pt: 3,
                    px: 4
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Add sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
                        <Typography variant="h4">
                            Crear Nuevo Grupo
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 4 }}>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Nombre del Grupo"
                        fullWidth
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        sx={{ 
                            mt: 1,
                            '& .MuiInputLabel-root': {
                                fontSize: '1.4rem'
                            },
                            '& .MuiInputBase-input': {
                                fontSize: '1.4rem'
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 4, pt: 2 }}>
                    <Button 
                        onClick={() => setCreateDialogOpen(false)}
                        sx={{ 
                            textTransform: 'none',
                            color: 'text.secondary',
                            fontSize: '1.3rem',
                            px: 3
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleCreateGroup} 
                        variant="contained" 
                        disabled={!newGroupName}
                        sx={{ 
                            textTransform: 'none',
                            px: 4,
                            py: 1,
                            fontSize: '1.3rem'
                        }}
                    >
                        Crear
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog 
                open={joinDialogOpen} 
                onClose={() => setJoinDialogOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: 24,
                        width: '100%',
                        maxWidth: 500
                    }
                }}
            >
                <DialogTitle sx={{ 
                    borderBottom: 1, 
                    borderColor: 'divider',
                    pb: 2,
                    pt: 3,
                    px: 4
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonAdd sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
                        <Typography variant="h4">
                            Unirse a un Grupo
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 4 }}>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Nombre del Grupo"
                        fullWidth
                        value={joinGroupName}
                        onChange={(e) => setJoinGroupName(e.target.value)}
                        sx={{ 
                            mt: 1,
                            '& .MuiInputLabel-root': {
                                fontSize: '1.4rem'
                            },
                            '& .MuiInputBase-input': {
                                fontSize: '1.4rem'
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 4, pt: 2 }}>
                    <Button 
                        onClick={() => setJoinDialogOpen(false)}
                        sx={{ 
                            textTransform: 'none',
                            color: 'text.secondary',
                            fontSize: '1.3rem',
                            px: 3
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleJoinGroup} 
                        variant="contained" 
                        disabled={!joinGroupName}
                        sx={{ 
                            textTransform: 'none',
                            px: 4,
                            py: 1,
                            fontSize: '1.3rem'
                        }}
                    >
                        Unirse
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserGroups;