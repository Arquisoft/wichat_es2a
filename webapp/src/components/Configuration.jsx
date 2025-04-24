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
import { loadConfig, saveConfig } from '../utils/config';

const theme = createTheme(defaultTheme);

const defaultConfig = {
  numQuestions: 10,
  timerSettings: { easy: 30, medium: 20, hard: 10 }
};

const Configuration = () => {
  const [config, setConfig] = useState(defaultConfig);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const stored = loadConfig();
    if (stored) {
      setConfig(stored);
    }
  }, []);

  const handleChangeNum = (e) => {
    const val = Math.max(1, parseInt(e.target.value, 10) || 1);
    setConfig(prev => ({ ...prev, numQuestions: val }));
  };

  const handleChangeTimer = (level) => (e) => {
    const val = Math.max(5, parseInt(e.target.value, 10) || 5);
    setConfig(prev => ({
      ...prev,
      timerSettings: { ...prev.timerSettings, [level]: val }
    }));
  };

  const handleSave = () => {
    saveConfig(config);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenSnackbar(false);
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
                  {['easy', 'medium', 'hard'].map((level) => (
                    <Grid item xs={12} sm={4} key={level}>
                      <TextField
                        label={level.charAt(0).toUpperCase() + level.slice(1)}
                        type="number"
                        fullWidth
                        value={config.timerSettings[level]}
                        onChange={handleChangeTimer(level)}
                        InputProps={{ inputProps: { min: 5 } }}
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
        <Snackbar
          open={openSnackbar}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="success"
            variant="filled"
            sx={{ width: '100%' }}
          >
            ¡Listo! Tus ajustes se han guardado 🎉
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default Configuration;
