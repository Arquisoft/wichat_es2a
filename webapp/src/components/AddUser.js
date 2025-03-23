// src/components/AddUser.js
import React, { useState } from 'react';
import axios from 'axios';
import { Container, Grid, Typography, TextField, Button, Snackbar, Alert } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import image from '../media/login.svg';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

const AddUser = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  const addUser = async () => {
    try {
      await axios.post(`${apiEndpoint}/adduser`, { username, password });
      setOpenSnackbar(true);
      // Redirigimos a la página de login
      navigate('/login');

    } catch (error) {
      // Verificamos si el error tiene el mensaje
      if (error.response && error.response.data.error) {
        setError(error.response.data.error); //Mostrar el mensaje de error en la interfaz de usuario
      }
      setError(error.response.data.error);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container component="main" maxWidth="xl" sx={{ marginTop: 4 }}>
      <Grid container spacing={2}>
        {/* Columna de la izquierda: Formulario */}
        <Grid item xs={12} md={4}>
          {/* Mostrar el mensaje de error en la interfaz de usuario */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Typography component="h1" variant="h5">
            Create your account
          </Typography>
          <Typography variant="body2" sx={{marginTop: 2}}>
            Have an account? <Link to="/login" style={{ color: '#1976D2', textDecoration: 'none' }}>Log in now</Link>
          </Typography>

          {/* Formulario para agregar un usuario */}
          <TextField
            name="username"
            margin="normal"
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <TextField
            name="password"
            margin="normal"
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Botón para agregar un usuario */}
          <Button variant="contained" color="primary" onClick={addUser}>
            Sign up
          </Button>

          {/* Snackbar para mostrar un mensaje de éxito */}
          <Snackbar
            open={openSnackbar}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            message="User added successfully" />
        </Grid>

        {/* Columna de la derecha: Imagen */}
        <Grid 
          item
          xs={12}
          md={8}
          sx={{
            display: {xs: 'none', md: 'flex'},
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}>
            <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
              <img 
                src={image} 
                alt="Login" 
                style={{ 
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover' }} />
            </div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AddUser;
