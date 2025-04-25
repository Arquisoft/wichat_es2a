import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Grid,
  Snackbar,
  Alert,
  Stack
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import defaultTheme from './config/default-Theme.json';
import { loadConfig, saveConfig, defaultConfig as initialConfig } from '../utils/config';

const theme = createTheme(defaultTheme);

// Map de niveles para usar labels en español y keys internas
const levels = [
  { key: 'easy', label: 'Fácil' },
  { key: 'medium', label: 'Medio' },
  { key: 'hard', label: 'Difícil' }
];

const Configuration = () => {
  const [config, setConfig] = useState(initialConfig);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);

  useEffect(() => {
    const stored = loadConfig();
    setConfig(stored);

    if (sessionStorage.getItem('configSaved') === 'true') {
      setOpenSuccess(true);
      sessionStorage.removeItem('configSaved');
    }
  }, []);

  const handleChangeNum = (e) => {
    const val = Math.max(1, parseInt(e.target.value, 10) || 1);
    setConfig(prev => ({ ...prev, numQuestions: val }));
  };

  const handleChangeTimer = (levelKey) => (e) => {
    const val = parseInt(e.target.value, 10) || 0;
    setConfig(prev => ({
      ...prev,
      timerSettings: {
        ...prev.timerSettings,
        [levelKey]: val
      }
    }));
  };

  const handleSave = () => {
    const { easy, medium, hard } = config.timerSettings;
    if (easy < 5 || medium < 5 || hard < 5) {
      setOpenError(true);
      return;
    }
    saveConfig(config);
    sessionStorage.setItem('configSaved', 'true');
    window.location.reload();
  };

  const handleCloseSuccess = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenSuccess(false);
  };

  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenError(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 4 }}>
          <Card sx={{ width: '100%', boxShadow: 4, borderRadius: 2 }}>
            <CardHeader
              title="Configuración"
              titleTypographyProps={{ variant: 'h4', align: 'center', gutterBottom: true }}
            />
            <Divider />
            <CardContent>
              <Stack spacing={3}>
                <TextField
                  label="Número de preguntas"
                  type="number"
                  fullWidth
                  value={config.numQuestions}
                  onChange={handleChangeNum}
                  InputProps={{ inputProps: { min: 1 } }}
                />

                <Typography variant="h6" sx={{ textAlign: 'center', mt: 2 }}>
                  Tiempo del Cronómetro (segundos)
                </Typography>

                <Grid container spacing={2}>
                  {levels.map(({ key, label }) => (
                    <Grid item xs={12} sm={4} key={key}>
                      <TextField
                        label={label}
                        type="number"
                        fullWidth
                        value={config.timerSettings[key]}
                        onChange={handleChangeTimer(key)}
                      />
                    </Grid>
                  ))}
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleSave}
                    sx={{ px: 4 }}
                  >
                    Guardar Cambios
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
        {/* Snackbar Éxito */}
        <Snackbar
          open={openSuccess}
          autoHideDuration={4000}
          onClose={handleCloseSuccess}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSuccess}
            severity="success"
            variant="filled"
            sx={{ width: '100%' }}
          >
            ¡Listo! Tus ajustes se han guardado 🎉
          </Alert>
        </Snackbar>
        {/* Snackbar Error */}
        <Snackbar
          open={openError}
          autoHideDuration={4000}
          onClose={handleCloseError}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseError}
            severity="error"
            variant="filled"
            sx={{ width: '100%' }}
          >
            Error: Los tiempos deben ser al menos 5 segundos.
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default Configuration;
