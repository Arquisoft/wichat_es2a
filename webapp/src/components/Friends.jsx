import React, { useState, useEffect } from 'react';
import FriendList from './FriendList';
import FriendSearch from './FriendSearch';
import { Box, Snackbar, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

function Friends() {
    const theme = useTheme();
    const [friends, setFriends] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    
    const user = JSON.parse(localStorage.getItem('user'));
    const username = user ? user.username : null;

    useEffect(() => {
        if (user) {
            fetch(`${apiEndpoint}/user/${user.username}`)
                .then((response) => response.json())
                .then((data) => setFriends(data.friends))
                .catch((error) => console.error('Error fetching friends:', error));
        }
    }, [user]);

    const handleAddFriend = (friendUsername) => {
        if (user) {
            fetch(`${apiEndpoint}/addFriend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: user.username, friendUsername }),
            })
                .then((response) => {
                    if (!response.ok) {
                        return response.json().then(data => {
                            throw new Error(data.error || 'Error desconocido');
                        });
                    }
                    return response.json();
                })
                .then(() => {
                    setSuccessMessage(`¡${friendUsername} fue añadido a tus amigos!`);
                    fetch(`/users/userservice/user/${user.username}`)
                        .then((response) => response.json())
                        .then((data) => setFriends(data.friends))
                        .catch((error) => console.error('Error fetching updated friends:', error));
                })
                .catch((error) => {
                    setErrorMessage(error.message);
                });
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                fontFamily: theme.typography.fontFamily,
                fontSize: theme.typography.fontSize,
                padding: theme.spacing(2),
                width: '100%',
            }}
        >
            <Box sx={{ flex: 1, pr: theme.spacing(2) }}>
                <FriendList friends={friends} user={user}/>
            </Box>
            <Box sx={{ flex: 1 }}>
                <FriendSearch onAddFriend={handleAddFriend} />
            </Box>
            <Snackbar
                open={!!successMessage}
                autoHideDuration={6000}
                onClose={() => setSuccessMessage('')}
                message={successMessage}
            />
            <Snackbar
                open={!!errorMessage}
                autoHideDuration={6000}
                onClose={() => setErrorMessage('')}
                message={errorMessage}
                severity="error"
            />
        </Box>
    );
}

export default Friends;