const express = require('express');
const cors = require('cors');
const mathGameRoutes = require('./mathGameRoutes');

// Crear la aplicación Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.disable('x-powered-by'); // Para mayor seguridad

// Usar las rutas del mathGame
app.use('/mathgame', mathGameRoutes);

// Ruta de salud para verificar que el servicio esté funcionando
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'MathGame service is running' });
});

// Exportamos la aplicación Express
module.exports = app;
