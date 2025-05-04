import React, { useEffect, useReducer, useState } from 'react';
import profilePic from '../media/fotousuario.png';
import { Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useNavigate } from 'react-router-dom';
import HistoryIcon from '@mui/icons-material/History';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

const apiEndpoint2 = process.env.USER_SERVICE_ENDPOINT || 'http://localhost:8001';

// Función para construir la URL del avatar de DiceBear desde avatarOptions
const getAvatarUrl = (options) => {
    if (!options) return '';
    const base = 'https://api.dicebear.com/9.x/big-smile/svg';
    const params = new URLSearchParams({
        hair: options.hair,
        eyes: options.eyes,
        mouth: options.mouth,
        hairColor: options.hairColor,
        skinColor: options.skinColor
    });
    return `${base}?${params.toString()}`;
}

function FriendList({ friends, user }) {
    const theme = useTheme();
    const username = user ? user.username : '';
    const [gameHistories, setGameHistories] = useState({}); // Estado para almacenar el historial de amigos
    const [openDialog, setOpenDialog] = useState(false); // Controla si el diálogo está abierto
    const [friendToRemove, setFriendToRemove] = useState(null); // El amigo a eliminar
    const navigate = useNavigate();

    // Función para abrir el diálogo de confirmación
    const handleOpenDialog = (friend) => {
        setFriendToRemove(friend); // Establecer el amigo a eliminar
        setOpenDialog(true); // Abre el diálogo
    };

    // Función para cerrar el diálogo de confirmación
    const handleCloseDialog = () => {
        setOpenDialog(false); // Cierra el diálogo
    };

    const handleRemoveFriend = async () => {

        if (!friendToRemove) return;

        try {
            const response = await axios.post(`${apiEndpoint}/removeFriend`, {
                username: user.username,
                friendUsername: friendToRemove.username
            });
            console.log(response.data.message);
        } catch (error) {
            console.error('Error al eliminar amigo:', error);
        }

        setOpenDialog(false); // Cierra el diálogo después de eliminar
    };

    useEffect(() => {
        const fetchGameHistories = async () => {
            const histories = {};
            for (let friend of friends) {
                try {
                    const response = await axios.get(`${apiEndpoint}/game/statistics`, { params: { userId: friend._id } });
                    histories[friend._id] = response.data || [];
                } catch (error) {
                    console.error(`Error al cargar historial de ${friend.username}`, error);
                    histories[friend._id] = [];
                }
            }
            setGameHistories(histories);
        };

        if (friends.length > 0) {
            fetchGameHistories();
        }
    }, [friends]); // Volver a ejecutar cuando la lista de amigos cambie

    // Función para obtener la fecha de la última partida de un amigo
    const getLastGameDate = (friendId) => {
        const friendHistory = gameHistories[friendId];
        if (friendHistory && friendHistory.length > 0) {
            const lastGame = friendHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
            return lastGame.createdAt;
        }
        return 'Nunca';
    };

    // Función para obtener el número total de partidas jugadas por un amigo
    const getTotalGamesPlayed = (friendId) => {
        const friendHistory = gameHistories[friendId];
        return friendHistory ? friendHistory.length : 0;
    };

    return (
        <Box sx={{ width: '100%', marginRight: 2, fontFamily: theme.typography.fontFamily, fontSize: theme.typography.fontSize }}>
            <Typography variant="h6" component="h2" gutterBottom sx={{ color: theme.palette.primary.main }}>
                Lista de Amigos
            </Typography>
            <List>
                {friends.map((friend) => (
                    <ListItem key={friend._id} alignItems="center" sx={{ padding: 1 }}>
                        <ListItemAvatar>
                        <Avatar 
                                sx={{ width: 40, height: 40, margin: 'auto' }} 
                                src={getAvatarUrl(friend.avatarOptions)} 
                            />
                        </ListItemAvatar>
                        <ListItemText 
                            primary={friend.username} 
                            secondary={`Última partida: ${getLastGameDate(friend._id)} | Total de partidas: ${getTotalGamesPlayed(friend._id)}`} 
                        />
                        <IconButton
                            edge="end"
                            color="secondary"
                            onClick={() => navigate(`/gamehistory/${friend.username}`)} // Navegar al historial
                            aria-label={`Historial de ${friend.username}`}
                            sx={{ mr: 1 }}
                        >
                            <HistoryIcon />
                        </IconButton>
                        <IconButton
                            edge="end"
                            color="secondary"
                            onClick={() => navigate(`/chat/${friend.username}`)} // Navegar al chat privado
                            aria-label={`Chat con ${friend.username}`}
                            sx={{ mr: 1 }}
                        >
                            <ChatBubbleOutlineIcon /> 
                        </IconButton>
                        <IconButton 
                            edge="end" 
                            color="secondary" 
                            onClick={() => handleOpenDialog(friend)}
                            aria-label="Eliminar amigo"
                        >
                            <DeleteIcon />
                        </IconButton>
                    </ListItem>
                ))}
            </List>
            {/* Diálogo de confirmación */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Confirmación</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        ¿Estás seguro de que deseas eliminar a {friendToRemove?.username} de tus amigos?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleRemoveFriend} color="secondary">
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default FriendList;