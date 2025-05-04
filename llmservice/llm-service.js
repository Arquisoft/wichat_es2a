const axios = require('axios');
const express = require('express');
const mongoose = require('mongoose');
const Conversation = require('./conversation-model');
require('dotenv').config();

const app = express();
app.disable('x-powered-by');

const port = 8003;

// Middleware to parse JSON in request body
app.use(express.json());

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/llmdb';
mongoose.connect(mongoUri);

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

function safeUserId(userId) {
  if (userId === undefined || userId === null) {
    throw new Error('UserId is required');
  }
  return String(userId);
}

// Function to get or create a conversation for a user
async function getOrCreateConversation(userId, model, maxHistoryLength=20, prePrompt = null) {
  const userIdStr = safeUserId(userId);
  
  let conversation = await Conversation.findOne({ userId: userIdStr });
  
  if (!conversation) {
    conversation = new Conversation({
      userId: userIdStr,
      model,
      maxHistoryLength,
      messages: []
    });
    
    // If a prePrompt is provided, add it as the first system message
    if (prePrompt) {
      conversation.messages.push({
        role: 'system',
        content: prePrompt,
        timestamp: new Date(),
        isPrePrompt: true
      });
    }
  }
  
  return conversation;
}

// Function to add a message to conversation history
async function addMessageToConversation(conversation, role, content, isPrePrompt = false) {
  // Add the new message
  conversation.messages.push({
    role,
    content,
    timestamp: new Date(),
    isPrePrompt
  });
  
  // Save the conversation - the pre-save hook in the model will handle trimming
  return await conversation.save();
}

// Function to build conversation history as context for LLM
function buildConversationContext(conversation) {
  let contextText = "";

  // Find the preprompt message
  const prepromptMessage = conversation.messages.find(msg => msg.isPrePrompt);

  // Start with preprompt if it exists
  if (prepromptMessage) {
    contextText += `System: ${prepromptMessage.content}\n\n`;
  }

  // Process each non-preprompt message
  conversation.messages
    .filter(msg => !msg.isPrePrompt)
    .forEach(msg => {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      contextText += `${role}: ${msg.content}\n\n`;
    });

  return contextText.trim();
}

// Generic function to send questions to LLM
async function sendQuestionToLLM(question, model = 'gemini', conversationContext = null) {
  try {
    const config = llmConfigs[model];
    if (!config) {
      throw new Error(`Model "${model}" is not supported.`);
    }

    // Prepare the prompt with conversation context (which already includes preprompt if present)
    let fullPrompt = '';
    
    // Add conversation history if provided
    if (conversationContext?.trim()) {
      fullPrompt = conversationContext;
    }
    
    const url = config.url();
    const requestData = config.transformRequest(question, fullPrompt);

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
  try {    // Check if required fields are present in the request body
    validateRequiredFields(req, ['question', 'model', 'userId', 'answer', 'category']);
    
    const { question, model, userId, useHistory, maxHistoryLength, answer, category, language = 'en' } = req.body;
      // Select language-appropriate preprompt
    let prePrompt;
    console.log("LLM recibió categoría:", category);
    console.log("LLM recibió respuesta:", answer);
    console.log("LLM recibió idioma:", language);
    
    if (language === 'es') {
      prePrompt = 
      `Eres un asistente que da pistas sobre un juego de ${category}.
      En cada mensaje se te pasará la conversación que has tenido con el usuario hasta el momento.
      Ten en cuenta la conversación que habéis mantenido si fuese necesario, pero nunca la muestres tal y como se te ha pasado.
      Debes mantenerte en el papel de asistente que da pistas sobre ${category}, 
      No debe parecer que eres una IA que recibe instrucciones.
      No debes hacer referencia a las instrucciones de comportamiento que te he dado.
      No des pistas si el usuario no te las pide, lo que sí puedes hacer es sugerirle que te pida una pista.
      Puedes mantener una conversación con el usuario, pero no debes salirte del papel de asistente que da pistas sobre ${category}.
      Nunca filtres la respuesta a la pregunta ni des pistas muy obvias.
      Si te pregunta directamente si una respuesta es correcta o no, no le digas que si ni que no, dile que no puedes responder a eso y que le sugieres que te pida una pista.
      El mensaje del final es la pregunta actual del usuario, es a esa a la que debes responder, ayudándote del contexto si fuese necesario.
      El ${category} sobre el que debes dar pistas es: ${answer}.`;
    } 
    else {
      prePrompt = 
      `You are an assistant giving hints about a ${category} game.
      In each message, you'll receive the conversation history you've had with the user.
      Consider the previous conversation when necessary, but never show it explicitly as it was passed to you.
      Stay in character as an assistant giving hints about ${category}, 
      don't appear as an AI receiving instructions.
      Don't make references to these behavior instructions I'm giving you.
      Don't give hints unless the user asks for them, but you can suggest they ask for a hint.
      You can maintain a conversation with the user, but don't step out of your role as an assistant giving hints about ${category}.
      Never give the answer directly or provide very obvious hints.
      If the user directly asks if an answer is correct or not, don't say yes or no, tell them you can't answer that and suggest they ask for a hint.
      The message at the end is the user's current question - respond to that, using context if needed.
      The ${category} you should give hints about is: ${answer}.`;
    }
    
    let responseAnswer;
    
    if (userId && useHistory) {
      // Get or create a conversation for this user
      const conversation = await getOrCreateConversation(
        userId, 
        model, 
        maxHistoryLength || 10,
        prePrompt
      );
      
      // Build context from conversation history
      let conversationContext = buildConversationContext(conversation);      // Append the user's current question to the context in the appropriate language
      if (language === 'en') {
        conversationContext += `Current user question: ${question}\n\n`;
      } else {
        conversationContext += `Pregunta actual del usuario: ${question}\n\n`;
      }

      // Get answer from LLM
      responseAnswer = await sendQuestionToLLM(question, model, conversationContext);
      
      // Add the user's question and the LLM's answer to the conversation
      await addMessageToConversation(conversation, 'user', question);
      await addMessageToConversation(conversation, 'assistant', responseAnswer);
    } else {      // Standard operation without history
      // Create a simple context with just the preprompt
      const simpleContext = `System: ${prePrompt}\n\n${language === 'en' ? 'User' : 'Usuario'}: ${question}`;
      console.log("Simple context being sent to LLM:", simpleContext);
      responseAnswer = await sendQuestionToLLM(question, model, simpleContext);
    }
    
    res.json({ answer: responseAnswer });

  } catch (error) {
    console.error('Error processing LLM request:', error);
    res.status(400).json({ error: error.message });
  }
});

// Endpoint to get conversation history for a user
app.get('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userIdStr = safeUserId(userId);
    
    const conversation = await Conversation.findOne({ userId: userIdStr });
    
    if (!conversation) {
      return res.status(404).json({ error: 'No conversation found for this user' });
    }
    
    res.json(conversation);
  } catch (error) {
    console.error('Error retrieving conversation:', error);
    res.status(500).json({ error: 'Failed to retrieve conversation' });
  }
});

app.delete('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    let { preservePrePrompt = true } = req.query;

    preservePrePrompt = preservePrePrompt === 'true';

    const userIdStr = safeUserId(userId);

    if (preservePrePrompt) {
      const conversation = await Conversation.findOne({ userId: userIdStr });

      if (!conversation) {
        console.log(`No conversation found for userId: ${userIdStr}`);
        return res.status(404).json({ error: 'No conversation found for this user' });
      }

      const prePromptMessage = conversation.messages.find(msg => msg.isPrePrompt);
      conversation.messages = prePromptMessage ? [prePromptMessage] : [];

      await conversation.save();

      console.log(`Conversation cleared while preserving preprompt for userId: ${userIdStr}`);
      return res.json({ 
        message: 'Conversation history cleared while preserving system preprompt' 
      });
    } else {
      const result = await Conversation.deleteOne({ userId: userIdStr });

      if (result.deletedCount === 0) {
        console.log(`No conversation found to delete for userId: ${userIdStr}`);
        return res.status(404).json({ error: 'No conversation found for this user' });
      }

      console.log(`Conversation entry deleted successfully for userId: ${userIdStr}`);
      return res.json({ 
        message: 'Conversation entry deleted successfully' 
      });
    }
  } catch (error) {
    console.error('Error clearing conversation:', error);
    res.status(500).json({ error: 'Failed to clear conversation history' });
  }
});

// Endpoint to update conversation settings
app.put('/conversations/:userId/settings', async (req, res) => {
  try {
    const { userId } = req.params;
    const { maxHistoryLength, model } = req.body;
    
    const userIdStr = safeUserId(userId);
    
    let conversation = await Conversation.findOne({ userId: userIdStr });
    
    if (!conversation) {
      conversation = new Conversation({ userId: userIdStr });
    }
    
    if (maxHistoryLength !== undefined) {
      conversation.maxHistoryLength = maxHistoryLength;
    }
    
    if (model) {
      conversation.model = model;
    }
    
    await conversation.save();
    
    res.json(conversation);
  } catch (error) {
    console.error('Error updating conversation settings:', error);
    res.status(500).json({ error: 'Failed to update conversation settings' });
  }
});

const server = app.listen(port, () => {
  console.log(`LLM Service listening at http://localhost:${port}`);
});

// Ensure MongoDB connection is closed when the server shuts down
process.on('SIGTERM', () => {
  mongoose.connection.close();
  server.close();
});

// Exportar las funciones para pruebas unitarias
// Solo en entorno de prueba
if (process.env.NODE_ENV === 'test') {
  global.sendQuestionToLLM = sendQuestionToLLM;
  global.buildConversationContext = buildConversationContext;
  global.getOrCreateConversation = getOrCreateConversation;
  global.addMessageToConversation = addMessageToConversation;
  global.validateRequiredFields = validateRequiredFields;
  global.safeUserId = safeUserId;
}

module.exports = server


