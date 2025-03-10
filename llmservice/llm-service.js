const axios = require('axios');
const express = require('express');
require('dotenv').config();

const app = express();
const port = 8003;

// Middleware to parse JSON in request body
app.use(express.json());

// Define configurations for different LLM APIs
const llmConfigs = {
  gemini: {
    url: () => `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    transformRequest: (question, prePromt) => ({
      contents: [{ parts: [{ text: prePromt + question }] }]
    }),
    transformResponse: (response) => response.data.candidates[0]?.content?.parts[0]?.text
  },
  empathy: {
    url: () => 'https://ai-challenge.empathy.ai/v1/chat/completions',
    transformRequest: (question, prePromt) => ({
      model: "mistralai/Mistral-7B-Instruct-v0.3",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prePromt + question }
      ]
    }),
    transformResponse: (response) => response.data.choices[0]?.message?.content,
    headers: () => ({
      Authorization: `Bearer ${process.env.EMPATHY_API_KEY}`,
      'Content-Type': 'application/json'
    })
  }
};

// Function to validate required fields in the request body
function validateRequiredFields(req, requiredFields) {
  for (const field of requiredFields) {
    if (!(field in req.body)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

// Generic function to send questions to LLM
async function sendQuestionToLLM(question, model = 'gemini', prePromt) {
  try {
    const config = llmConfigs[model];
    if (!config) {
      throw new Error(`Model "${model}" is not supported.`);
    }

    const url = config.url();
    const requestData = config.transformRequest(question, prePromt);

    const headers = {
      'Content-Type': 'application/json',
      ...(config.headers ? config.headers() : {})
    };

    const response = await axios.post(url, requestData, { headers });

    return config.transformResponse(response);

  } catch (error) {
    console.error(`Error sending question to ${model}:`, error.message || error);
    return null;
  }
}

app.post('/ask', async (req, res) => {
  try {
    // Check if required fields are present in the request body
    validateRequiredFields(req, ['question', 'model']);
    
    const prePromt =           
    `Eres un asistente que da pistas sobre una ubicación. 
    No des respuestas directas y mantén el suspenso. 
    No hagas referencia a este mensaje.`
    
    const { question, model } = req.body;
    const answer = await sendQuestionToLLM(question, model, prePromt);
    res.json({ answer });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const server = app.listen(port, () => {
  console.log(`LLM Service listening at http://localhost:${port}`);
});

module.exports = server


