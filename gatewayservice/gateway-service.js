const express = require('express');
const axios = require('axios');
const cors = require('cors');
const promBundle = require('express-prom-bundle');
//libraries required for OpenAPI-Swagger
const swaggerUi = require('swagger-ui-express');
const fs = require("fs")
const YAML = require('yaml')

const app = express();
app.disable('x-powered-by');
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

// Helper to proxy requests and handle errors in a DRY way
async function handleProxyRequest(res, axiosFn, args, errorMsg = 'Internal error', statusOverride) {
  try {
    const response = await axiosFn(...args);
    res.json(response.data);
  } catch (error) {
    if (error && error.response && typeof error.response.status === 'number') {
      const errMsg = error.response.data && typeof error.response.data.error === 'string'
        ? error.response.data.error
        : errorMsg;
      res.status(statusOverride || error.response.status).json({ error: errMsg });
    } else {
      res.status(statusOverride || 500).json({ error: errorMsg });
    }
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.post('/login', (req, res) =>
  handleProxyRequest(res, axios.post, [authServiceUrl + '/login', req.body], 'Internal error')
);

app.post('/adduser', (req, res) =>
  handleProxyRequest(res, axios.post, [userServiceUrl + '/adduser', req.body], 'Internal error')
);

app.post('/askllm', (req, res) => {
  console.log("Gateway: Solicitud LLM recibida con params:", {
    question: req.body.question,
    category: req.body.category,
    answer: req.body.answer,
    language: req.body.language || 'en'
  });
  handleProxyRequest(
    res,
    axios.post,
    [llmServiceUrl + '/ask', req.body],
    'An error occurred while communicating with the LLM service'
  );
});

// Get conversation history for a user
app.get('/conversations/:userId', (req, res) =>
  handleProxyRequest(res, axios.get, [`${llmServiceUrl}/conversations/${req.params.userId}`], 'An error occurred while retrieving conversation history')
);

// Clear conversation history for a user
app.delete('/conversations/:userId', (req, res) =>
  handleProxyRequest(
    res,
    axios.delete,
    [`${llmServiceUrl}/conversations/${req.params.userId}`, { params: { preservePrePrompt: req.query.preservePrePrompt } }],
    'An error occurred while clearing conversation history'
  )
);

// Update conversation settings
app.put('/conversations/:userId/settings', (req, res) =>
  handleProxyRequest(
    res,
    axios.put,
    [`${llmServiceUrl}/conversations/${req.params.userId}/settings`, req.body],
    'An error occurred while updating conversation settings'
  )
);

app.get('/wikidata/question/:category/:number', (req, res) => {
  console.log("Requesting questions from Wikidata");
  handleProxyRequest(
    res,
    axios.get,
    [`${wikidataServiceUrl}/wikidata/question/${req.params.category}/${req.params.number}`],
    'Error getting the questions from Wikidata'
  );
});

app.post('/wikidata/verify', (req, res) =>
  handleProxyRequest(res, axios.post, [`${wikidataServiceUrl}/wikidata/verify`, req.body], 'Error verifying the answer')
);

app.post('/game/start', (req, res) => {
  console.log("Starting game with body:", req.body);
  handleProxyRequest(res, axios.post, [`${wikidataServiceUrl}/game/start`, req.body], 'Error starting the game');
});

app.post('/game/end', (req, res) =>
  handleProxyRequest(res, axios.post, [`${wikidataServiceUrl}/game/end`, req.body], 'Error ending the game')
);

app.get('/game/statistics', (req, res) =>
  handleProxyRequest(res, axios.get, [`${wikidataServiceUrl}/game/statistics`, { params: req.query }], 'Error fetching game statistics')
);

app.get('/game/ranking', (req, res) =>
  handleProxyRequest(res, axios.get, [`${wikidataServiceUrl}/game/ranking`, { params: req.query }], 'Error fetching game ranking')
);


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
app.get('/group/listGroups', (req, res) =>
  handleProxyRequest(res, axios.get, [`${groupServiceUrl}/listGroups`, { params: req.query }], 'Error fetching groups')
);
app.post('/group/createGroup', (req, res) =>
  handleProxyRequest(res, axios.post, [`${groupServiceUrl}/createGroup`, req.body], 'Error creating group')
);
app.post('/group/addUserToGroup', (req, res) =>
  handleProxyRequest(res, axios.post, [`${groupServiceUrl}/addUserToGroup`, req.body], 'Error add user to group')
);
app.get('/group/listGroupUsers', (req, res) =>
  handleProxyRequest(res, axios.get, [`${groupServiceUrl}/listGroupUsers`, { params: req.query }], 'Error fetching group users')
);
app.get('/getUserId', (req, res) =>
  handleProxyRequest(res, axios.get, [`${userServiceUrl}/getUserId`, { params: req.query }], 'Error fetching group users')
);
app.get('/getUsername', (req, res) =>
  handleProxyRequest(res, axios.get, [`${userServiceUrl}/getUsername`, { params: req.query }], 'Error fetching group users')
);
app.get('/users/:id', (req, res) =>
  handleProxyRequest(res, axios.get, [`${userServiceUrl}/users/${req.params.id}`], 'Error fetching user by id')
);
app.put('/users/:id', (req, res) =>
  handleProxyRequest(res, axios.put, [`${userServiceUrl}/users/${req.params.id}`, req.body], 'Error updating user')
);
app.post('/group/sendMessage', (req, res) =>
  handleProxyRequest(res, axios.post, [`${groupServiceUrl}/group/sendMessage`, req.body], 'Error sending group message')
);
app.get('/group/messages', (req, res) =>
  handleProxyRequest(res, axios.get, [`${groupServiceUrl}/group/messages`, { params: req.query }], 'Error fetching group messages')
);

app.get('/mathgame/question/:base?', (req, res) => {
  const raw = req.params.base;
  const suffix = raw != null && !Number.isNaN(parseInt(raw, 10))
    ? `?base=${parseInt(raw, 10)}`
    : '';
  handleProxyRequest(
    res,
    axios.get,
    [`${mathGameServiceUrl}/mathgame/question${suffix}`],
    'Error fetching math question'
  );
});

app.post('/mathgame/verify', (req, res) =>
  handleProxyRequest(res, axios.post, [`${mathGameServiceUrl}/mathgame/verify`, req.body], 'Error verifying math answer')
);


// Start the gateway service
const server = app.listen(port, () => {
  console.log(`Gateway Service listening at http://localhost:${port}`);
});

module.exports = server
