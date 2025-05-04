const express = require('express');
const axios = require('axios');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express'); 
const fs = require("fs");
const YAML = require('yaml');

const app = express();
app.disable('x-powered-by');

const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:8002';
const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:8001';
const wikidataServiceUrl = process.env.WIKIDATA_SERVICE_URL || 'http://localhost:3001';

app.use(cors({
  origin: process.env.WEBAPP_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'OK' }));

app.get('/questions', async (req, res) => {
  try {
    const response = await axios.get(`${wikidataServiceUrl}/questions`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data?.error || 'Error getting the questions from Wikidata' });
  }
});

app.get('/questions/:category', async (req, res) => {
  try {
    const response = await axios.get(`${wikidataServiceUrl}/questions/${req.params.category}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data?.error || 'Error getting the questions from Wikidata' });
  }
});

app.get('/users', async (req, res) => {
  try {
    const response = await axios.get(`${userServiceUrl}/listUsers`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data?.error || 'Error getting the users from User Service' });
  }
});

app.get('/users/:username', async (req, res) => {
  try {
    const response = await axios.get(`${userServiceUrl}/user/${req.params.username}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data?.error || 'Error getting the user from User Service' });
  }
});

const openapiPath = './openapi.yaml';
if (fs.existsSync(openapiPath)) {
  const file = fs.readFileSync(openapiPath, 'utf8');
  const swaggerDocument = YAML.parse(file);
  app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} else {
  console.log("Not configuring OpenAPI. Configuration file not present.");
}

module.exports = app;
