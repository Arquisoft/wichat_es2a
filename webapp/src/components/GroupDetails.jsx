import React, { useEffect, useState } from 'react';
import { 
    Typography, Box, CircularProgress, List, ListItem,
    ListItemText, ListItemIcon, Paper, Button
} from '@mui/material';
import { Person, AdminPanelSettings, Groups, Chat as ChatIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import GroupChat from './GroupChat';

const apiEndpoint = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8000';

const GroupDetails = () => {
    const { groupName } = useParams();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showChat, setShowChat] = useState(false);

    useEffect(() => {
        const fetchGroupUsers = async () => {
            try {
                const response = await axios.get(`${apiEndpoint}/group/listGroupUsers`, {
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

    const handleUserClick = (userId) => {
        navigate(`/gamehistory/${userId}`);
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
        <Box sx={{ 
            p: 3,
            backgroundColor: '#fff',
            minHeight: '100vh',
            position: 'relative'
        }}>
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                mb: 4,
                backgroundColor: '#e3f2fd',
                p: 4,
                borderRadius: 3,
                boxShadow: 3
            }}>
                <Groups sx={{ fontSize: 45, color: 'primary.main', mr: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    Grupo: {groupName}
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Button
                    variant={showChat ? 'contained' : 'outlined'}
                    color="primary"
                    startIcon={<ChatIcon />}
                    onClick={() => setShowChat((prev) => !prev)}
                    sx={{ ml: 2, minWidth: 48, borderRadius: 2 }}
                >
                    {showChat ? 'Cerrar chat' : 'Abrir chat'}
                </Button>
            </Box>

            <List component={Paper} sx={{ 
                width: '100%', 
                bgcolor: '#e3f2fd',
                borderRadius: 2,
                boxShadow: 2
            }}>
                {users.map((user) => (
                    <ListItem 
                        key={user.username}
                        onClick={() => handleUserClick(user.username)}
                        sx={{
                            p: 2,
                            cursor: 'pointer',
                            '&:hover': { 
                                bgcolor: 'action.hover',
                                transform: 'translateY(-2px)',
                                transition: 'all 0.2s ease-in-out'
                            }
                        }}
                    >
                        <ListItemIcon>
                            {user.role === 'admin' ? 
                                <AdminPanelSettings sx={{ fontSize: 35, color: 'primary.main' }} /> : 
                                <Person sx={{ fontSize: 35, color: 'primary.main' }} />
                            }
                        </ListItemIcon>
                        <ListItemText 
                            primary={user.username}
                            secondary={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            sx={{
                                '& .MuiListItemText-primary': {
                                    fontSize: '1.5rem',
                                    fontWeight: 500
                                },
                                '& .MuiListItemText-secondary': {
                                    fontSize: '1.1rem'
                                }
                            }}
                        />
                    </ListItem>
                ))}
            </List>
            {}
            {showChat && (
                <Box sx={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    height: '100vh',
                    width: { xs: '100%', sm: '100%', md: '33vw', lg: '33vw' },
                    maxWidth: 420,
                    zIndex: 1300,
                    bgcolor: '#f5f5f5',
                    boxShadow: 6,
                    display: 'flex',
                    flexDirection: 'column',
                    borderLeft: '3px solid #1976d2',
                    transition: 'all 0.3s',
                }}>
                    <GroupChat groupName={groupName} onClose={() => setShowChat(false)} />
                </Box>
            )}
        </Box>
    );
};

export default GroupDetails;