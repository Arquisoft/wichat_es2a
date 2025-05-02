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
const mathGameServiceUrl = process.env.MATHGAME_SERVICE_URL || 'http://localhost:3002';
const groupServiceUrl = process.env.GROUP_SERVICE_URL || 'http://localhost:8004';

app.use(cors());
app.use(express.json());

//Prometheus configuration
const metricsMiddleware = promBundle({ includeMethod: true });
app.use(metricsMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.post('/login', async (req, res) => {
  try {
    // Forward the login request to the authentication service
    const authResponse = await axios.post(authServiceUrl + '/login', req.body);
    res.json(authResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});

app.post('/adduser', async (req, res) => {
  try {
    // Forward the add user request to the user service
    const userResponse = await axios.post(userServiceUrl + '/adduser', req.body);
    res.json(userResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});

app.post('/askllm', async (req, res) => {
  try {
    // Log the request parameters
    console.log("Gateway: Solicitud LLM recibida con params:", {
      question: req.body.question,
      category: req.body.category,
      answer: req.body.answer,
      language: req.body.language || 'en'
    });
    
    // Forward the LLM question request to the LLM service
    const llmResponse = await axios.post(llmServiceUrl + '/ask', req.body);
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
openapiPath = './openapi.yaml'
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
app.get('/group/listGroups', async (req, res) => {
  try {
    const response = await axios.get(`${groupServiceUrl}/listGroups`, { params: req.query });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data?.error || 'Error fetching groups' });
  }
});
app.post('/group/createGroup', async (req, res) => {
  try {
    const response = await axios.post(`${groupServiceUrl}/createGroup`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data?.error || 'Error creating group' });
  }
});
app.post('/group/addUserToGroup', async (req, res) => {
  try {
    const response = await axios.post(`${groupServiceUrl}/addUserToGroup`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data?.error || 'Error add user to group' });
  }
});
app.get('/group/listGroupUsers', async (req, res) => {
  try {
    const response = await axios.get(`${groupServiceUrl}/listGroupUsers`, { params: req.query });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data?.error || 'Error fetching group users' });
  }
});
app.get('/getUserId', async (req, res) => {
  try {
    const response = await axios.get(`${userServiceUrl}/getUserId`, { params: req.query });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data?.error || 'Error fetching group users' });
  }
});
app.get('/getUsername', async (req, res) => {
  try {
    const response = await axios.get(`${userServiceUrl}/getUsername`, { params: req.query });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data?.error || 'Error fetching group users' });
  }
});
app.get('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const response = await axios.get(`${userServiceUrl}/users/${userId}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data?.error || 'Error fetching user by id' });
  }
});
app.put('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const response = await axios.put(`${userServiceUrl}/users/${userId}`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data?.error || 'Error updating user' });
  }
});
app.post('/group/sendMessage', async (req, res) => {
  try {
    const response = await axios.post(`${groupServiceUrl}/group/sendMessage`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data?.error || 'Error sending group message' });
  }
});
app.get('/group/messages', async (req, res) => {
  try {
    const response = await axios.get(`${groupServiceUrl}/group/messages`, { params: req.query });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data?.error || 'Error fetching group messages' });
  }
});

app.get('/mathgame/question/:base?', async (req, res) => {
  try {
    const raw = req.params.base;
    const suffix = raw != null && !Number.isNaN(parseInt(raw, 10))
      ? `?base=${parseInt(raw, 10)}`
      : '';
    const response = await axios.get(`${mathGameServiceUrl}/mathgame/question${suffix}`);

    res.json(response.data);
  } catch (error) {
    console.error('Error getting math question:', error);
    res
      .status(error.response?.status || 500)
      .json({ error: error.response?.data?.error || 'Error fetching math question' });
  }
});

app.post('/mathgame/verify', async (req, res) => {
  try {
    const response = await axios.post(`${mathGameServiceUrl}/mathgame/verify`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error verifying math answer:', error);
    res
      .status(error.response?.status || 500)
      .json({ error: error.response?.data?.error || 'Error verifying math answer' });
  }
});


// Start the gateway service
const server = app.listen(port, () => {
  console.log(`Gateway Service listening at http://localhost:${port}`);
});

module.exports = server
