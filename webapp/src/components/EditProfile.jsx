import React, { useState, useEffect } from 'react';
import {
    Container, TextField, Button, Typography, Alert, Snackbar, Box, Paper
} from '@mui/material';
import AvatarEditor from './AvatarEditor';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const apiEndpoint = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8000';

const EditProfile = () => {
    const [username, setUsername] = useState('');
    const [avatarOptions, setAvatarOptions] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const getUserId = () => {
        const userData = JSON.parse(localStorage.getItem('user'));
        const decoded = jwtDecode(userData.token);
        return decoded?.userId;
    };

    const userId = getUserId();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(`${apiEndpoint}/users/${userId}`);
                setUsername(res.data.username);

                if(res.data.avatarOptions) {
                    setAvatarOptions(res.data.avatarOptions);
                } else {
                    setAvatarOptions({
                        hairColor: '3a1a00',
                        eyes: 'cheery',
                        hair: 'shortHair',
                        mouth: 'teethSmile',
                        skinColor: 'efcc9f'
                    });
                }
                
            } catch (err) {
                console.error(err);
                setError('No se pudo cargar el perfil.');
            }
        };
        fetchUser();
    }, [userId]);

    const handleSave = async () => {
        if (!username.trim()) {
            setError("El nombre de usuario no puede estar vacío.");
            return;
        }

        try {
            await axios.put(`${apiEndpoint}/users/${userId}`, {
                username,
                avatarOptions
            });
            setSuccess(true);
            setTimeout(() => navigate('/profile'), 1000);
        } catch (error) {
            console.error(error);
            setError(error.response.data.error);
        }
    };

    return (
        <Container maxWidth="sm">
            <Paper sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" gutterBottom>Editar Perfil</Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <TextField
                    fullWidth
                    label="Nombre de usuario"
                    margin="normal"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                {avatarOptions && (
                    <Box sx={{ mt: 3 }}>
                        <AvatarEditor
                            avatarOptions={avatarOptions}
                            setAvatarOptions={setAvatarOptions}
                        />
                    </Box>
                )}

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    sx={{ mt: 4 }}
                    fullWidth
                >
                    Guardar Cambios
                </Button>
            </Paper>

            <Snackbar
                open={success}
                autoHideDuration={3000}
                onClose={() => setSuccess(false)}
                message="Perfil actualizado con éxito"
            />
        </Container>
    );
};

export default EditProfile;
