// src/components/AddUser.js
import React, { useState } from 'react';
import axios from 'axios';
import { Container, Typography, TextField, Button, Snackbar, Alert } from '@mui/material';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

const AddUser = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const addUser = async () => {
    try {
      await axios.post(`${apiEndpoint}/adduser`, { username, password });
      setOpenSnackbar(true);
    } catch (error) {
      // Verificamos si el error tiene el mensaje
      if (error.response && error.response.data.error){
        setError(error.response.data.error); //Mostrar el mensaje de error en la interfaz de usuario
      }
      setError(error.response.data.error);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ marginTop: 4 }}>
      <Typography component="h1" variant="h5">
        Add User
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
        Add User
      </Button>

      {/* Mostrar el mensaje de error en la interfaz de usuario */}
      {error && (
        <Alert severity="error" sx={{mt:2}}>
          {error}
        </Alert>
      )}

      {/* Snackbar para mostrar un mensaje de éxito */}
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar} 
        message="User added successfully" />
    </Container>
  );
};

export default AddUser;
