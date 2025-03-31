import React, { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';

function FriendSearch({ onAddFriend }) {
    const theme = useTheme();
    const [friendUsername, setFriendUsername] = useState('');

    const handleAddFriend = () => {
        onAddFriend(friendUsername);
        setFriendUsername('');
    };

    return (
        <Box sx={{ width: '30%', fontFamily: theme.typography.fontFamily, fontSize: theme.typography.fontSize }}>
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
            />
            <Button
                variant="contained"
                color="primary"
                onClick={handleAddFriend}
            >
                Añadir
            </Button>
        </Box>
    );
}

export default FriendSearch;