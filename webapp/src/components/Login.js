// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import {useNavigate, Link} from 'react-router-dom';   // Importamos el hook useNavigate
import { Container, Typography, TextField, Button, Snackbar } from '@mui/material';
import { Typewriter } from "react-simple-typewriter"; // Animación de escritura


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
  const navigate = useNavigate(); // Hook de navegación

  // Variables de entorno para la API y la clave de la API
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';
  const apiKey = process.env.REACT_APP_LLM_API_KEY || 'None';

  // Función para autenticar al usuario
  const loginUser = async () => {
    setLoading(true); // Activamos la carga
    try {
      // Realizamos la petición al servidor
      const response = await axios.post(`${apiEndpoint}/login`, { username, password });

      const question = "Please, generate a greeting message for a student called " + username + " that is a student of the Software Architecture course in the University of Oviedo. Be nice and polite. Two to three sentences max.";
      const model = "empathy"

      if (apiKey==='None'){
        setMessage("LLM API key is not set. Cannot contact the LLM.");
      }
      else{
        const responseMessage = await axios.post(`${apiEndpoint}/askllm`, { question, model, apiKey })
        setMessage(responseMessage.data.answer);
      }
      // Extract data from the response
      const { createdAt: userCreatedAt } = response.data;

      setCreatedAt(userCreatedAt);
      setLoginSuccess(true);
      setOpenSnackbar(true);

      // Guardamos el usuario en el localStorage
      localStorage.setItem("user", JSON.stringify(response.data));

      // Redirigimos al usuario a la página del juego
      navigate('/game');

     
    } catch (error) {
      // Caputramos errores de autenticación y mostramos el mensaje adecuado
      const errorMsg = error.response?.data?.error || 'An error occurred';
      setError(errorMsg);
    } finally {
      setLoading(false);  // Desactivamos la carga
    }
  };

  // Función para cerrar el Snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ marginTop: 4 }}>
      {loginSuccess ? (
        <div>
          <Typewriter
            words={[message]} // Pass your message as an array of strings
            cursor
            cursorStyle="|"
            typeSpeed={50} // Typing speed in ms
          />
          <Typography component="p" variant="body1" sx={{ textAlign: 'center', marginTop: 2 }}>
            Your account was created on {new Date(createdAt).toLocaleDateString()}.
          </Typography>
        </div>
      ) : (
        <div>
          <Typography component="h1" variant="h5">
            Login
          </Typography>
          <TextField
            margin="normal"
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button variant="contained" color="primary" onClick={loginUser} disabled={loading}>
            {loading ? "Loggin in..." : "Login"}
          </Button>
          <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar} message="Login successful" />
          {error && (
            <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')} message={`Error: ${error}`} />
          )}
          <Typography variant="body2" sx={{marginTop: 2}}>
            Don't have an account? <Link to="/adduser" style={{ color: '#1976D2', textDecoration: 'none' }}>Sign up</Link>
          </Typography>
        </div>
      )}
    </Container>
  );
};

export default Login;
