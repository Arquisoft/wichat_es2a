import React from 'react';
import profilePic from '../media/fotousuario.png';
import { Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText } from '@mui/material';
import { useTheme } from '@mui/material/styles';

function FriendList({ friends }) {
    const theme = useTheme();

    return (
        <Box sx={{ width: '30%', marginRight: 2, fontFamily: theme.typography.fontFamily, fontSize: theme.typography.fontSize }}>
            <Typography variant="h6" component="h2" gutterBottom sx={{ color: theme.palette.primary.main }}>
                Lista de Amigos
            </Typography>
            <List>
                {friends.map((friend) => (
                    <ListItem key={friend._id} alignItems="center" sx={{ padding: 1 }}>
                        <ListItemAvatar>
                            <Avatar src={profilePic} alt="Foto de perfil" />
                        </ListItemAvatar>
                        <ListItemText primary={friend.username} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
}

export default FriendList;