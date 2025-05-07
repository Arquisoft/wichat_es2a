const express = require('express');
const router = express.Router();
const service = require('./service/mathGameService');

// Configuración básica
router.use(express.json());



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
router.get('/question', (req, res) => {
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
router.post('/verify', (req, res) => {
  try {
    const { choice, correct } = req.body;
    const isCorrect = Number(choice) === Number(correct);
    res.json({ isCorrect });
  } catch (err) {
    console.error('Error verifying math answer:', err);
    res.status(500).json({ error: 'Error verifying math answer' });
  }
});

module.exports = router;
