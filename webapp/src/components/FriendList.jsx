import React, { useEffect, useState } from 'react';
import profilePic from '../media/fotousuario.png';
import { Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

function FriendList({ friends, user }) {
    const theme = useTheme();
    const username = user ? user.username : '';
    const [gameHistories, setGameHistories] = useState({}); // Estado para almacenar el historial de amigos

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
                            secondary={`Última vez en línea: ${getLastGameDate(friend._id)}`} 
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
}

export default FriendList;