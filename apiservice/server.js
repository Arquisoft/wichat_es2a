const app = require('./api-service');
const port = 8008;

const server = app.listen(port, () => {
  console.log(`API Service listening at http://localhost:${port}`);
});
