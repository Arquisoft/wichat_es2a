const app = require('./app');
const PORT = process.env.MATHGAME_PORT || 3002;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`MathGame service listening at http://localhost:${PORT}`);
  });
}
