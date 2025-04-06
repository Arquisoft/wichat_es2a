import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';

function FriendSearch({ onAddFriend }) {
    const theme = useTheme();
    const [friendUsername, setFriendUsername] = useState('');
    const [userResults, setUserResults] = useState([]);  // Resultados de la búsqueda

    // Realizar la búsqueda de usuarios en el backend
    const searchUsers = async (query) => {
        try {
            const response = await axios.get(`http://localhost:8001/listUsers?query=${query}`);
            setUserResults(response.data);  // Actualizar los resultados de la búsqueda
        } catch (error) {
            console.error('Error al buscar usuarios:', error);
        }
    };

    // Realizar la búsqueda cada vez que el usuario escribe
    useEffect(() => {
        if (friendUsername) {
            searchUsers(friendUsername);
        } else {
            setUserResults([]);  // Si el campo está vacío, limpiamos los resultados
        }
    }, [friendUsername]);

    const handleAddFriend = () => {
        onAddFriend(friendUsername);
        setFriendUsername('');
    };

    return (
        <Box sx={{ width: '100%', fontFamily: theme.typography.fontFamily, fontSize: theme.typography.fontSize, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" component="h2" gutterBottom sx={{ color: theme.palette.secondary.main }}>
                Añadir Amigo
            </Typography>
            <TextField
                label="Nombre de usuario del amigo"
                variant="outlined"
                value={friendUsername}
                onChange={(e) => setFriendUsername(e.target.value)}
                fullWidth
                margin="normal"
                sx={{ flexGrow: 1 }}
            />
            {userResults.length > 0 && (
                <List sx={{ maxHeight: 200, overflowY: 'auto', mt: 2, border: '1px solid #ccc' }}>
                    {userResults.map((user) => (
                        <ListItem button key={user._id} onClick={() => setFriendUsername(user.username)}>
                            <ListItemText primary={user.username} />
                        </ListItem>
                    ))}
                </List>
            )}
            <Button
                variant="contained"
                color="primary"
                onClick={handleAddFriend}
                sx={{ mt: 2 }}
            >
                Añadir
            </Button>
        </Box>
    );
}

export default FriendSearch;