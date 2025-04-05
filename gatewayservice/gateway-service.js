const express = require('express');
const axios = require('axios');
const cors = require('cors');
const promBundle = require('express-prom-bundle');
//libraries required for OpenAPI-Swagger
const swaggerUi = require('swagger-ui-express'); 
const fs = require("fs")
const YAML = require('yaml')

const app = express();
const port = 8000;

const llmServiceUrl = process.env.LLM_SERVICE_URL || 'http://localhost:8003';
const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:8002';
const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:8001';
const wikidataServiceUrl = process.env.WIKIDATA_SERVICE_URL || 'http://localhost:3001';

// Get host and webapp port from environment variables or use defaults
const deployHost = process.env.DEPLOY_HOST || 'localhost';
const webappPort = process.env.WEBAPP_PORT || '3000';
const corsOrigin = `http://${deployHost}:${webappPort}`;

console.log(`CORS origin set to: ${corsOrigin}`);

app.use(cors({
  origin: corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

//Prometheus configuration
const metricsMiddleware = promBundle({includeMethod: true});
app.use(metricsMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.post('/login', async (req, res) => {
  try {
    // Forward the login request to the authentication service
    const authResponse = await axios.post(authServiceUrl+'/login', req.body);
    res.json(authResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});

app.post('/adduser', async (req, res) => {
  try {
    // Forward the add user request to the user service
    const userResponse = await axios.post(userServiceUrl+'/adduser', req.body);
    res.json(userResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});

app.post('/askllm', async (req, res) => {
  try {
    // Forward the LLM question request to the LLM service
    const llmResponse = await axios.post(llmServiceUrl+'/ask', req.body);
    res.json(llmResponse.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.error || 'An error occurred while communicating with the LLM service' 
    });
  }
});

// Get conversation history for a user
app.get('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const llmResponse = await axios.get(`${llmServiceUrl}/conversations/${userId}`);
    res.json(llmResponse.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.error || 'An error occurred while retrieving conversation history' 
    });
  }
});

// Clear conversation history for a user
app.delete('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { preservePrePrompt } = req.query;
    
    const llmResponse = await axios.delete(
      `${llmServiceUrl}/conversations/${userId}`, 
      { params: { preservePrePrompt } }
    );
    
    res.json(llmResponse.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.error || 'An error occurred while clearing conversation history' 
    });
  }
});

// Update conversation settings
app.put('/conversations/:userId/settings', async (req, res) => {
  try {
    const { userId } = req.params;
    const llmResponse = await axios.put(`${llmServiceUrl}/conversations/${userId}/settings`, req.body);
    res.json(llmResponse.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.error || 'An error occurred while updating conversation settings' 
    });
  }
});

app.get('/wikidata/question/:category/:number', async (req, res) => {
  try {
    console.log("Requesting questions from Wikidata");
    const category = req.params.category;
    const number = req.params.number;
    const response = await axios.get(`${wikidataServiceUrl}/wikidata/question/${category}/${number}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data?.error || 'Error getting the questions from Wikidata' });
  }
});

app.post('/wikidata/verify', async (req, res) => {
  try {
    const response = await axios.post(`${wikidataServiceUrl}/wikidata/verify`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data?.error || 'Error verifying the answer' });
  }
});

app.get('/wikidata/clear', async (req, res) => {
  try {
    const response = await axios.get(`${wikidataServiceUrl}/wikidata/clear`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data?.error || 'Error clearing questions' });
  }
});

app.post('/game/start', async (req, res) => {
  try {
    console.log("Starting game with body:", req.body);
    const response = await axios.post(`${wikidataServiceUrl}/game/start`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data?.error || 'Error starting the game' });
  }
});

app.post('/game/end', async (req, res) => {
  try {
    const response = await axios.post(`${wikidataServiceUrl}/game/end`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data?.error || 'Error ending the game' });
  }
});

app.get('/game/statistics', async (req, res) => {
  try {
    const response = await axios.get(`${wikidataServiceUrl}/game/statistics`, { params: req.query });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data?.error || 'Error fetching game statistics' });
  }
});


// Read the OpenAPI YAML file synchronously
openapiPath='./openapi.yaml'
if (fs.existsSync(openapiPath)) {
  const file = fs.readFileSync(openapiPath, 'utf8');

  // Parse the YAML content into a JavaScript object representing the Swagger document
  const swaggerDocument = YAML.parse(file);

  // Serve the Swagger UI documentation at the '/api-doc' endpoint
  // This middleware serves the Swagger UI files and sets up the Swagger UI page
  // It takes the parsed Swagger document as input
  app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} else {
  console.log("Not configuring OpenAPI. Configuration file not present.")
}


// Start the gateway service
const server = app.listen(port, () => {
  console.log(`Gateway Service listening at http://localhost:${port}`);
});

module.exports = server
