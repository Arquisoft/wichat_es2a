import React, { useEffect, useState } from 'react';
import profilePic from '../media/fotousuario.png';
import { Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';
const apiEndpoint2 = 'http://localhost:8001';

function FriendList({ friends, user }) {
    const theme = useTheme();
    const username = user ? user.username : '';
    const [gameHistories, setGameHistories] = useState({}); // Estado para almacenar el historial de amigos

    const handleRemoveFriend = async (friendUsername) => {
        try {
            const response = await axios.post(`${apiEndpoint2}/removeFriend`, {
                username: user.username,
                friendUsername: friendUsername
            });
            alert(response.data.message); // Muestra un mensaje de éxito
            // Aquí podríamos actualizar la lista de amigos después de eliminar uno
            // Podríamos hacer un fetch de la lista de amigos actualizada, o eliminarlo del estado local.
        } catch (error) {
            console.error('Error al eliminar amigo:', error);
            alert(error.response ? error.response.data.error : 'Hubo un problema al eliminar el amigo.');
        }
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
            return new Date(lastGame.createdAt).toLocaleString('es-ES');
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
                {username && (
                    <ListItem key="you" alignItems="center" sx={{ padding: 1, bgcolor: theme.palette.grey[200] }}>
                        <ListItemAvatar>
                            <Avatar src={profilePic} alt="Tu foto de perfil" />
                        </ListItemAvatar>
                        <ListItemText primary={`Tú: ${username}`} secondary="(Jugador)" />
                    </ListItem>
                )}
                {friends.map((friend) => (
                    <ListItem key={friend._id} alignItems="center" sx={{ padding: 1 }}>
                        <ListItemAvatar>
                            <Avatar src={profilePic} alt="Foto de perfil" />
                        </ListItemAvatar>
                        <ListItemText 
                            primary={friend.username} 
                            secondary={`Última partida: ${getLastGameDate(friend._id)} | Total de partidas: ${getTotalGamesPlayed(friend._id)}`} 
                        />
                        <IconButton 
                            edge="end" 
                            color="secondary" 
                            onClick={() => handleRemoveFriend(friend.username)}
                            aria-label="Eliminar amigo"
                        >
                            <DeleteIcon />
                        </IconButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
}

export default FriendList;