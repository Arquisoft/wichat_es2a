// src/components/AddUser.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Grid, Typography, TextField,
  Button, Snackbar, Alert, IconButton, InputAdornment,
  Box, ToggleButtonGroup, ToggleButton
} from '@mui/material';

import {
  Visibility, VisibilityOff
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';

import VisibilityIcon from '@mui/icons-material/Visibility';
import BrushIcon from '@mui/icons-material/Brush';
import TagFacesIcon from '@mui/icons-material/TagFaces';
import PaletteIcon from '@mui/icons-material/Palette';



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
  const [hairColor, setHairColor] = useState('3a1a00');
  const [eyeStyle, setEyeStyle] = useState('cheery');
  const [hairType, setHairType] = useState('shortHair');
  const [mouth, setMouth] = useState('teethSmile');
  const [skin, setSkin] = useState('efcc9f');
  const [activeCategory, setActiveCategory] = useState('skin'); // puede ser 'hair' o 'eyes'
  const [avatarUrl, setAvatarUrl] = useState(`https://api.dicebear.com/9.x/big-smile/svg?hairColor=${hairColor}&eyes=${eyeStyle}&hair=${hairType}&mouth=${mouth}&skinColor=${skin}`);

  const navigate = useNavigate();

  // Según vayamos cambiando el avatar, se va mostrando
  useEffect(() => {
    const newAvatarUrl = `https://api.dicebear.com/9.x/big-smile/svg?hairColor=${hairColor}&eyes=${eyeStyle}&hair=${hairType}&mouth=${mouth}&skinColor=${skin}`;
    setAvatarUrl(newAvatarUrl);
  }, [hairColor, eyeStyle, hairType, mouth, skin]);

  const addUser = async () => {
    try {
      await axios.post(`${apiEndpoint}/adduser`, {
        username,
        password,
        confirmPassword,
        avatarOptions: {
          hair: hairType,
          eyes: eyeStyle,
          mouth: mouth,
          hairColor: hairColor,
          skinColor: skin
        }
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

          <Box sx={{
            width: '200px',
            height: '200px',
            marginBottom: 3,
            borderRadius: '50%',
            overflow: 'hidden',
            boxShadow: 2
          }}
          >
            <img
              src={avatarUrl}
              alt="Avatar"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%'
              }} />
          </Box>

          {/* Controles de personalización */}
          <Box sx={{ width: '100%', textAlign: 'center' }}>
            <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }} >
              Customize your Avatar
            </Typography>

            {/* Selector de Categoría tipo Mii */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
              {/* Piel */}
              <IconButton
                aria-label="piel"
                onClick={() => setActiveCategory('skin')}
                color={activeCategory === 'skin' ? 'primary' : 'default'}
              >
                <PaletteIcon fontSize="large" />
              </IconButton>

              {/* Pelo */}
              <IconButton
                aria-label="pelo"
                onClick={() => setActiveCategory('hair')}
                color={activeCategory === 'hair' ? 'primary' : 'default'}
              >
                <BrushIcon fontSize="large" />
              </IconButton>

              {/* Ojos */}
              <IconButton
                aria-label="ojos"
                onClick={() => setActiveCategory('eyes')}
                color={activeCategory === 'eyes' ? 'primary' : 'default'}
              >
                <VisibilityIcon fontSize="large" />
              </IconButton>

              {/* Boca */}
              <IconButton
                aria-label="boca"
                onClick={() => setActiveCategory('mouth')}
                color={activeCategory === 'mouth' ? 'primary' : 'default'}
              >
                <TagFacesIcon fontSize="large" />
              </IconButton>
            </Box>

            {/* Contenido de la categoría activa */}
            {/* Piel */}
            {activeCategory === 'skin' && (
              <Box>
                <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                  Select Eye Style
                </Typography>
                <ToggleButtonGroup
                  value={skin}
                  exclusive
                  onChange={(e, val) => val && setSkin(val)}
                  color="primary"
                  size="small"
                  sx={{
                    flexWrap: 'wrap',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 1
                  }}
                >
                  <ToggleButton value="643d19">Deep Brown</ToggleButton>
                  <ToggleButton value="8c5a2b">Espresso</ToggleButton>
                  <ToggleButton value="a47539">Bronze</ToggleButton>
                  <ToggleButton value="c99c62">Tan</ToggleButton>
                  <ToggleButton value="e2ba87">Ligth Tan</ToggleButton>
                  <ToggleButton value="efcc9f">Beige</ToggleButton>
                  <ToggleButton value="f5d7b1">Ligth Beige</ToggleButton>
                  <ToggleButton value="ffe4c0">Porcelain</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            )}
            {/* Pelo */}
            {activeCategory === 'hair' && (
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                    Select Hair Color
                  </Typography>
                  <ToggleButtonGroup
                    value={hairColor}
                    exclusive
                    onChange={(e, val) => val && setHairColor(val)}
                    color="primary"
                    size="small"
                    sx={{
                      flexWrap: 'wrap',
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 1
                    }}
                  >
                    <ToggleButton value="3a1a00">Brown</ToggleButton>
                    <ToggleButton value="e2ba87">Blonde</ToggleButton>
                    <ToggleButton value="220f00">Black</ToggleButton>
                    <ToggleButton value="238d80">Green</ToggleButton>
                    <ToggleButton value="605de4">Blue</ToggleButton>
                    <ToggleButton value="d56c0c">Orange</ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                    Select Type Hair
                  </Typography>
                  <ToggleButtonGroup
                    value={hairType}
                    exclusive
                    onChange={(e, val) => val && setHairType(val)}
                    color="primary"
                    size="small"
                    sx={{
                      flexWrap: 'wrap',
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 1
                    }}
                  >
                    <ToggleButton value="bangs">bangs</ToggleButton>
                    <ToggleButton value="shortHair">shortHair</ToggleButton>
                    <ToggleButton value="bowlCutHair">bowlCutHair</ToggleButton>
                    <ToggleButton value="bunHair">bunHair</ToggleButton>
                    <ToggleButton value="curlyBob">curlyBob</ToggleButton>
                    <ToggleButton value="curlyShortHair">curlyShortHair</ToggleButton>
                    <ToggleButton value="froBun">froBun</ToggleButton>
                    <ToggleButton value="halfShavedHead">halfShavedHead</ToggleButton>
                    <ToggleButton value="mohawk">mohawk</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Box>
            )}

            {activeCategory === 'eyes' && (
              <Box>
                <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                  Select Eye Style
                </Typography>
                <ToggleButtonGroup
                  value={eyeStyle}
                  exclusive
                  onChange={(e, val) => val && setEyeStyle(val)}
                  color="primary"
                  size="small"
                  sx={{
                    flexWrap: 'wrap',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 1
                  }}
                >
                  <ToggleButton value="angry">angry</ToggleButton>
                  <ToggleButton value="cheery">cheery</ToggleButton>
                  <ToggleButton value="confused">confused</ToggleButton>
                  <ToggleButton value="normal">normal</ToggleButton>
                  <ToggleButton value="sad">sad</ToggleButton>
                  <ToggleButton value="sleepy">sleepy</ToggleButton>
                  <ToggleButton value="starstruck">starstruck</ToggleButton>
                  <ToggleButton value="winking">winking</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            )}

            {activeCategory === 'mouth' && (
              <Box>
                <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                  Select Mouth Style
                </Typography>
                <ToggleButtonGroup
                  value={mouth}
                  exclusive
                  onChange={(e, val) => val && setMouth(val)}
                  color="primary"
                  size="small"
                  sx={{
                    flexWrap: 'wrap',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 1
                  }}
                >
                  <ToggleButton value="awkwardSmile">awkwardSmile</ToggleButton>
                  <ToggleButton value="braces">braces</ToggleButton>
                  <ToggleButton value="gapSmile">gapSmile</ToggleButton>
                  <ToggleButton value="kawaii">kawaii</ToggleButton>
                  <ToggleButton value="openedSmile">openedSmile</ToggleButton>
                  <ToggleButton value="openSad">openSad</ToggleButton>
                  <ToggleButton value="teethSmile">teethSmile</ToggleButton>
                  <ToggleButton value="unimpressed">unimpressed</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            )}
          </Box>



        </Grid>
      </Grid>
    </Container>
  );
};

export default AddUser;
