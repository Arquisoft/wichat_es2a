// mathGame/index.js

const express = require('express');
const app = express();
const service = require('./service/mathGameService');

app.use(express.json());

const PORT = process.env.MATHGAME_PORT || 3002;
app.listen(PORT, () => {
  console.log(`MathGame service listening at http://localhost:${PORT}`);
});

/**
 * GET /mathgame/question/:base?
 * Devuelve una nueva operación matemática y opciones.
 * - base (opcional): número previo para encadenar la expresión.
 *
 * Ejemplos:
 *  GET /mathgame/question           → primera expresión (base = null)
 *  GET /mathgame/question/30        → expresión partiendo de 30
 *
 * Respuesta JSON:
 * {
 *   expr: "30 * 3",
 *   options: [90, 87, 93, 100],
 *   correct: 90
 * }
 */
app.get('/mathgame/question', (req, res) => {
  try {
    const raw = req.query.base;
    const base = raw != null && !Number.isNaN(parseInt(raw, 10))
      ? parseInt(raw, 10)
      : null;

    const { expr, result } = service.generateExpression(base);
    const options = service.generateOptions(result);

    res.json({ expr, options, correct: result });
  } catch (err) {
    console.error('Error generating math question:', err);
    res.status(500).json({ error: 'Error generating math question' });
  }
});


/**
 * POST /mathgame/verify
 * Comprueba si la elección del usuario es correcta.
 * Recibe JSON:
 * {
 *   choice: number,
 *   correct: number
 * }
 *
 * Respuesta JSON:
 * {
 *   isCorrect: boolean
 * }
 */
app.post('/mathgame/verify', (req, res) => {
  try {
    const { choice, correct } = req.body;
    const isCorrect = Number(choice) === Number(correct);
    res.json({ isCorrect });
  } catch (err) {
    console.error('Error verifying math answer:', err);
    res.status(500).json({ error: 'Error verifying math answer' });
  }
});
