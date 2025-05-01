// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';   // Importamos el hook useNavigate
import {
  Container, Grid, Typography, TextField,
  Button, Snackbar, Alert, IconButton, InputAdornment
} from '@mui/material';
import {
  Visibility, VisibilityOff
} from '@mui/icons-material';
import image from '../media/login.svg';


const Login = () => {
  // Estados para manejar la entrada de usuario y la UI
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [createdAt, setCreatedAt] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);  // Estado para manejar la carga
  const [showPassword, setShowPassword] = useState(false); // mostrar contraseña
  const navigate = useNavigate(); // Hook de navegación

  // Variable de entorno para la API
  const apiEndpoint = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8000';

  // Función para autenticar al usuario
  const loginUser = async () => {
    // Validación de campos vacíos
    if (!username.trim() || !password.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }
    setError(null); // Limpiamos el error previo
    setLoading(true); // Activamos la carga
    try {
      // Realizamos la petición al servidor
      const response = await axios.post(`${apiEndpoint}/login`, { username, password });

      // const question = "Please, generate a greeting message for a student called " + username + " that is a student of the Software Architecture course in the University of Oviedo. Be nice and polite. Two to three sentences max.";
      // const model = "empathy"

      // if (apiKey === 'None') {
      //   setMessage("LLM API key is not set. Cannot contact the LLM.");
      // }
      // else {
      //   const responseMessage = await axios.post(`${apiEndpoint}/askllm`, { question, model, apiKey })
      //   setMessage(responseMessage.data.answer);
      // }
      // // Extract data from the response
      // const { createdAt: userCreatedAt } = response.data;

      // setCreatedAt(userCreatedAt);
      setLoginSuccess(true);


      // Guardamos el usuario en el localStorage
      localStorage.setItem("user", JSON.stringify(response.data));
      setOpenSnackbar(true); // Mostramos el snackbar
      // Redirigimos al usuario a la página del juego
      navigate('/home');
      setOpenSnackbar(true); // Mostramos el snackbar

    } catch (error) {
      // Caputramos errores de autenticación y mostramos el mensaje adecuado
      if (error.response && error.response.data?.error) {
        setError(error.response.data.error); //Mostrar el mensaje de error en la interfaz de usuario
      } else {
        setError("Ha ocurrido un error inesperado.");
      }

    } finally {
      setLoading(false);  // Desactivamos la carga
    }
  };

  // Función para cerrar el Snackbar
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
            <Alert severity="error" sx={{ mt: 2 }} role="alert">
              {error}
            </Alert>
          )}
          <Typography component="h1" variant="h5">
            Log in to your account
          </Typography>

          <Typography variant="body2" sx={{ marginTop: 2 }}>
            Don't have an account? <Link to="/adduser" style={{ color: '#1976D2', textDecoration: 'none' }}>Sign up</Link>
          </Typography>

          {/* Formulario para login */}
          <TextField
            data-testid="username-field"
            margin="normal"
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <TextField
            data-testid="password-field"
            margin="normal"
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value.toString())}
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

          <Button variant="contained" color="primary" onClick={loginUser} disabled={loading}>
            {loading ? "Loggin in..." : "Login"}
          </Button>

        </Grid>

        {/* Columna de la derecha: Imagen */}
        <Grid
          item
          xs={12}
          md={8}
          sx={{
            display: { xs: 'none', md: 'flex' },
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
                objectFit: 'cover'
              }} />
          </div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Login;
