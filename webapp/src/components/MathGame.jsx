import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import defaultTheme from '../config/default-Theme.json';
import Countdown from './Countdown';
import { generateExpression, generateOptions } from '../utils/mathGameService';

const theme = createTheme(defaultTheme);

/**
 * Componente MathGame: modo de juego matemático infinito.
 * @param {{ timeLimit?: number }} props
 */
const MathGame = ({ timeLimit = 10 }) => {
  const [expr, setExpr] = useState('');
  const [answer, setAnswer] = useState(null);
  const [options, setOptionsState] = useState([]);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const startTimeRef = useRef(null);
  const [totalTime, setTotalTime] = useState(0);

  // Iniciar o reiniciar el juego
  const initGame = () => {
    const { expr: e, result } = generateExpression(null);
    setExpr(e);
    setAnswer(result);
    setOptionsState(generateOptions(result));
    setScore(0);
    setEnded(false);
    setStarted(true);
    startTimeRef.current = Date.now();
  };

  // Manejo de elección
  const onSelect = (choice) => {
    if (!started || ended) return;
    if (choice === answer) {
      setScore(s => s + 1);
      const { expr: nextExpr, result: nextResult } = generateExpression(answer);
      setExpr(nextExpr);
      setAnswer(nextResult);
      setOptionsState(generateOptions(nextResult));
    } else {
      finishGame();
    }
  };

  // Finaliza juego por error o timeout
  const finishGame = () => {
    if (ended) return;
    const now = Date.now();
    setTotalTime(((now - startTimeRef.current) / 1000).toFixed(1));
    setEnded(true);
  };

  // Cuando el timer expire
  const onTimeout = () => {
    finishGame();
  };

  useEffect(() => {
    // limpia side-effects si se reinicia
    return () => {};
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            {!started && !ended && (
              <Button variant="contained" size="large" onClick={initGame}>
                Iniciar Juego Matemático
              </Button>
            )}

            {started && !ended && (
              <>
                <Typography variant="h6" gutterBottom>
                  Resuelve en {timeLimit}s:
                </Typography>
                <Typography variant="h4" color="primary" gutterBottom>
                  {expr}
                </Typography>
                <Countdown customTime={timeLimit} onCountdownFinish={onTimeout} />
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  {options.map((opt, idx) => (
                    <Grid item xs={6} key={idx}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => onSelect(opt)}
                      >
                        {opt}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
                <Typography variant="subtitle1" sx={{ mt: 2 }}>
                  Puntuación: {score}
                </Typography>
              </>
            )}

            {ended && (
              <Box>
                <Typography variant="h4" color="error" gutterBottom>
                  ¡Juego Terminado!
                </Typography>
                <Typography variant="h6">
                  Respuestas correctas: {score}
                </Typography>
                <Typography variant="h6">
                  Tiempo total: {totalTime}s
                </Typography>
              </Box>
            )}
          </CardContent>
          <Divider />
          <CardActions sx={{ justifyContent: 'center', p: 2 }}>
            {ended && (
              <Button variant="contained" onClick={initGame}>
                Volver a Jugar
              </Button>
            )}
          </CardActions>
        </Card>
      </Container>
    </ThemeProvider>
  );
};

export default MathGame;
