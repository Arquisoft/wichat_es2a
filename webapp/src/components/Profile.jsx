import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Avatar, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        username: '',
    });

    // Suponiendo que la información del usuario está almacenada en el localStorage
    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) {
            setUser(userData);
        } else {
            // Si no hay datos, redirigir al login
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Avatar sx={{ width: 120, height: 120, margin: 'auto' }} src={user.avatar} />
                <Typography variant="h4" sx={{ mt: 2 }}>
                    ¡Bienvenido/a {user.username || 'Usuario'}!
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                    Aquí puedes ver y editar tu perfil.
                </Typography>

                <Box sx={{ mt: 3 }}>
                    <Button variant="contained" color="primary" onClick={() => navigate('/edit-profile')}>
                        Editar Perfil
                    </Button>
                </Box>

                <Box sx={{ mt: 2 }}>
                    <Button variant="outlined" color="error" onClick={handleLogout}>
                        Cerrar Sesión
                    </Button>
                </Box>
            </Box>

        </Container>
    );
};

export default ProfilePage;
