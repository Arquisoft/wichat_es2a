// src/components/AddUser.js
import React, { useState } from 'react';
import axios from 'axios';
import {
  Container, Grid, Typography, TextField,
  Button, Snackbar, Alert, IconButton, InputAdornment} from '@mui/material';

import {
  Visibility, VisibilityOff
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';

import AvatarEditor from './AvatarEditor';



const apiEndpoint = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8000';

const AddUser = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // confirmacion de contraseña
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // mostrar contraseña
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // mostrar confirmar contraseña
  // Para el avatar
  const [avatarOptions, setAvatarOptions] = useState({
    hairColor: '3a1a00',
    eyes: 'cheery',
    hair: 'shortHair',
    mouth: 'teethSmile',
    skinColor: 'efcc9f'
  });

  const navigate = useNavigate();

  const addUser = async () => {
    try {
      await axios.post(`${apiEndpoint}/adduser`, {
        username,
        password,
        confirmPassword,
        avatarOptions
      });

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
          <Typography variant="body2" sx={{ marginTop: 2 }}>
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
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <TextField
            name="confirmPassword"
            margin="normal"
            fullWidth
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
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

        {/* Columna de la derecha: Avatar y personalización */}
        <Grid item xs={12} md={8} sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          height: '100%',
          paddingBottom: { xs: 2, md: 0 }
        }}>
          <AvatarEditor avatarOptions={avatarOptions} setAvatarOptions={setAvatarOptions} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default AddUser;
