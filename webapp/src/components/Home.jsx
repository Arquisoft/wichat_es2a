// src/components/Home.jsx
import React, { useState } from 'react';
import { Container, Grid, Typography, Button, Box, Select, MenuItem, InputLabel, FormControl, FormHelperText } from '@mui/material';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import image from '../media/logoWiChat.svg';

const Home = () => {

  // Estado para la categoría del juego
  const [category, setCategory] = useState('');
  const [error, setError] = useState(false); // Para gestionar errores en la selección de categoría
  const navigate = useNavigate(); // Hook para la navegación programática


  // Objeto para mapear categorías con emojis
  // Este objeto se utiliza para mostrar un emoji junto a cada categoría en el menú desplegable
  // Cada clave del objeto representa una categoría y su valor es el emoji correspondiente
  // Se pueden añadir más categorias y emojis según sea necesario
  const categoryEmojis = {
    "Futbolistas": "⚽",
    "Arte": "🎨",
    "Pintores": "🖌️",
    "Cantantes": "🎤",
    "Filosofos": "🧠",
    "Actores": "🎬",
    "Científicos": "🔬",
    "DeportistasEspañoles": "🏅",
    "Lugares": "🌍",
    "Banderas": "🏳️‍🌈",
  };


  // Función para manejar el cambio de categoría
  // Esta función se ejecuta cada vez que el usuario selecciona una categoría en el menú desplegable
  // Se actualiza el estado de la categoría y se limpia el error si se selecciona una categoría válida
  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
    setError(false);
  };

  // Función para manejar el inicio del juego
  // Esta función se ejecuta cuando el usuario hace clic en el botón "Comenzar a jugar"
  // Verifica si se ha seleccionado una categoría y navega a la ruta del juego con la categoría seleccionada
  const handleStartGame = () => {
    console.log('Boton Comenzar pulsado');
    if (!category) {
      setError(true);
    } else {
      navigate(`/game?category=${category}`);
    }
  };


  return (
    <Container component="main" maxWidth="xl" sx={{ marginTop: 4, padding: { xs: 2, sm: 4 } }}>
      <Grid container spacing={4}>
        {/* Left column: Welcome message */}
        <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }} gutterBottom>
            WICHAT
          </Typography>
          <Typography variant="h6" paragraph sx={{ color: 'text.secondary', fontWeight: 300, lineHeight: 1.5 }}>
            El legendario concurso de conocimientos ahora en formato digital. ¡Pon a prueba tus habilidades y compite con otros jugadores!
          </Typography>


          {/* Selector de categorías */}
          <FormControl fullWidth error={error} sx={{ marginBottom: 2 }}>
            <InputLabel id="category-select-label">Seleccionar categoría</InputLabel>
            <Select
              labelId="category-select-label"
              value={category}
              label="Seleccionar categoría"
              onChange={handleCategoryChange}
              displayEmpty
            >

              {Object.keys(categoryEmojis).map((categoria, index) => (
                <MenuItem key={index} value={categoria}>
                  {categoria} {categoryEmojis[categoria]}
                </MenuItem>
              ))}

            </Select>

            {/* Mensaje de error si no se selecciona una categoría */}
            {error && <FormHelperText>Por favor, selecciona una categoría.</FormHelperText>}

          </FormControl>


          <Box>
            <Button
              variant="contained"
              color="primary"
              // component={Link}
              // to="/game"
              // to={`/game?category=${category}`}
              onClick={handleStartGame} // Validar la categoria antes de redirigir
              sx={{
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 600,
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'secondary.main',
                  transform: 'scale(1.05)',
                },
              }}
            >
              Comenzar a jugar
            </Button>
          </Box>
        </Grid>

        {/* Right column: Image */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <img
            src={image}
            alt="Home"
            style={{
              width: '100%',
              height: '100%',
              maxWidth: '450px',
              objectFit: 'cover',
            }}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;
