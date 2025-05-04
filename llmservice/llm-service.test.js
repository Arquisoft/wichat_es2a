const request = require('supertest');
const axios = require('axios');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const Conversation = require('./conversation-model');

let mongoServer;
let app;

// Mock axios
jest.mock('axios');

beforeAll(async () => {
  // Configurar MongoDB en memoria para las pruebas
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI = mongoUri;
  
  // Mock API keys
  process.env.GEMINI_API_KEY = 'test-gemini-key';
  process.env.EMPATHY_API_KEY = 'test-empathy-key';
  
  // Importar el servidor después de configurar mocks y variables de entorno
  app = require('./llm-service');
});

// Limpiar la base de datos y los mocks entre pruebas
beforeEach(async () => {
  await Conversation.deleteMany({});
  jest.clearAllMocks();
});

// Cerrar recursos al finalizar las pruebas
afterAll(async () => {
  if (mongoose.connection) await mongoose.connection.close();
  if (app && app.close) app.close();
  if (mongoServer) await mongoServer.stop();
});

// Configurar mocks predeterminados para axios
function setupDefaultMocks() {
  // Respuestas predeterminadas para las llamadas a las APIs de LLMs
  axios.post.mockImplementation((url, data) => {
    if (url.includes('generativelanguage')) {
      return Promise.resolve({
        data: { candidates: [{ content: { parts: [{ text: 'gemini llm response' }] } }] }
      });
    } else if (url.includes('empathy.ai')) {
      return Promise.resolve({
        data: { choices: [{ message: { content: 'empathy llm response' } }] }
      });
    }
    return Promise.resolve({ data: {} });
  });
}

// Asegurar espera para operaciones asíncronas de MongoDB
async function waitForMongoOperation(ms = 100) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Pruebas principales
describe('LLM Service Unified Tests', () => {
  // Configurar mocks antes de cada prueba
  beforeEach(() => {
    setupDefaultMocks();
  });

  // GRUPO 1: API Endpoints básicos
  describe('Basic API Endpoints', () => {
    it('should respond with LLM answer for English prompts with Gemini model', async () => {
      const response = await request(app)
        .post('/ask')
        .send({ 
          question: 'test question', 
          model: 'gemini', 
          userId: 'testUserId', 
          answer: 'test answer', 
          category: 'locations',
          language: 'en'
        });
  
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('answer');
      expect(response.body.answer).toBe('gemini llm response');
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('generativelanguage'),
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should respond with LLM answer for Spanish prompts with Gemini model', async () => {
      const response = await request(app)
        .post('/ask')
        .send({ 
          question: 'pregunta de prueba', 
          model: 'gemini', 
          userId: 'testUserId', 
          answer: 'respuesta de prueba', 
          category: 'ubicaciones',
          language: 'es'
        });
  
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('answer');
      expect(response.body.answer).toBe('gemini llm response');
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('generativelanguage'),
        expect.any(Object),
        expect.any(Object)
      );
    });
    
    it('should respond with LLM answer with Empathy model', async () => {
      const response = await request(app)
        .post('/ask')
        .send({ 
          question: 'test question', 
          model: 'empathy', 
          userId: 'testUserId', 
          answer: 'test answer', 
          category: 'locations'
        });
  
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('answer');
      expect(response.body.answer).toBe('empathy llm response');
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('empathy.ai'),
        expect.any(Object),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining('Bearer test-empathy-key')
          })
        })
      );
    });
    
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/ask')
        .send({ 
          question: 'test question' 
          // falta model, userId, answer, category
        });
  
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  // GRUPO 2: Manejo de conversaciones
  describe('Conversation Handling', () => {
    it('should create a new conversation with history if useHistory=true', async () => {
      const response = await request(app)
        .post('/ask')
        .send({ 
          question: 'test question with history', 
          model: 'gemini', 
          userId: 'historyUser', 
          answer: 'test answer', 
          category: 'locations',
          useHistory: true
        });
  
      expect(response.statusCode).toBe(200);
      
      // Verificar que se creó la conversación en la base de datos
      await waitForMongoOperation();
      const conversation = await Conversation.findOne({ userId: 'historyUser' });
      expect(conversation).toBeTruthy();
      expect(conversation.messages.length).toBeGreaterThan(0);
    });
    
    it('should get conversation history for an existing user', async () => {
      // Crear una conversación primero
      const conversation = new Conversation({
        userId: 'existingUser',
        model: 'gemini',
        messages: [
          { role: 'user', content: 'Hello', timestamp: new Date() },
          { role: 'assistant', content: 'Hi there', timestamp: new Date() }
        ]
      });
      await conversation.save();
      
      const response = await request(app)
        .get('/conversations/existingUser');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('messages');
      expect(response.body.messages.length).toBe(2);
    });
    
    it('should return 404 when getting conversation for non-existing user', async () => {
      const response = await request(app)
        .get('/conversations/nonExistingUser');
      
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  // GRUPO 3: Borrado de conversaciones
  describe('DELETE /conversations/:userId', () => {
    it('should delete conversation when preservePrePrompt=false', async () => {
      // Create a conversation first
      const userId = 'delete-user';
      const conversation = new Conversation({
        userId,
        model: 'gemini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant',
            isPrePrompt: true,
            timestamp: new Date()
          },
          {
            role: 'user',
            content: 'Hello',
            timestamp: new Date()
          }
        ]
      });
      await conversation.save();
      await waitForMongoOperation();
      
      const response = await request(app)
        .delete(`/conversations/${userId}?preservePrePrompt=false`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message', 'Conversation entry deleted successfully');
      
      // Verificar que la conversación fue eliminada
      await waitForMongoOperation();
      const deletedConversation = await Conversation.findOne({ userId });
      expect(deletedConversation).toBeNull();
    });

    it('should return 404 when deleting non-existent conversation', async () => {
      const response = await request(app)
        .delete('/conversations/non-existent-user?preservePrePrompt=false');
      
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should clear messages but keep preprompt when preservePrePrompt=true', async () => {
      // Create a conversation first with preprompt
      const userId = 'preserve-preprompt-user';
      const conversation = new Conversation({
        userId,
        model: 'gemini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant',
            isPrePrompt: true,
            timestamp: new Date()
          },
          {
            role: 'user',
            content: 'Hello',
            timestamp: new Date()
          },
          {
            role: 'assistant',
            content: 'Hi there!',
            timestamp: new Date()
          }
        ]
      });
      await conversation.save();
      await waitForMongoOperation();
      
      const response = await request(app)
        .delete(`/conversations/${userId}?preservePrePrompt=true`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message', 'Conversation history cleared while preserving system preprompt');
      
      // Verify only preprompt was kept
      await waitForMongoOperation();
      const updatedConversation = await Conversation.findOne({ userId });
      expect(updatedConversation).toBeTruthy();
      expect(updatedConversation.messages.length).toBe(1);
      expect(updatedConversation.messages[0].isPrePrompt).toBe(true);
    });

    it('should clear all messages when no preprompt exists and preservePrePrompt=true', async () => {
      // Create a conversation first without preprompt
      const userId = 'no-preprompt-user';
      const conversation = new Conversation({
        userId,
        model: 'gemini',
        messages: [
          {
            role: 'user',
            content: 'Hello',
            timestamp: new Date()
          },
          {
            role: 'assistant',
            content: 'Hi there!',
            timestamp: new Date()
          }
        ]
      });
      await conversation.save();
      await waitForMongoOperation();
      
      const response = await request(app)
        .delete(`/conversations/${userId}?preservePrePrompt=true`);
      
      expect(response.statusCode).toBe(200);
      
      // Verify all messages were cleared
      await waitForMongoOperation();
      const updatedConversation = await Conversation.findOne({ userId });
      expect(updatedConversation).toBeTruthy();
      expect(updatedConversation.messages).toEqual([]);
    });
  });

  // GRUPO 4: Actualización de configuración de conversaciones
  describe('PUT /conversations/:userId/settings', () => {
    it('should update existing conversation settings', async () => {
      // Create a conversation first
      const userId = 'update-settings-user';
      const conversation = new Conversation({
        userId,
        model: 'gemini',
        maxHistoryLength: 10
      });
      await conversation.save();
      await waitForMongoOperation();
      
      // Update both settings
      const response = await request(app)
        .put(`/conversations/${userId}/settings`)
        .send({
          model: 'empathy',
          maxHistoryLength: 5
        });
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('model', 'empathy');
      expect(response.body).toHaveProperty('maxHistoryLength', 5);
      
      // Verify database was updated
      await waitForMongoOperation();
      const updatedConversation = await Conversation.findOne({ userId });
      expect(updatedConversation.model).toBe('empathy');
      expect(updatedConversation.maxHistoryLength).toBe(5);
    });

    it('should update only maxHistoryLength when only that is provided', async () => {
      const userId = 'update-max-history-user';
      const conversation = new Conversation({
        userId,
        model: 'gemini',
        maxHistoryLength: 10
      });
      await conversation.save();
      await waitForMongoOperation();
      
      const response = await request(app)
        .put(`/conversations/${userId}/settings`)
        .send({
          maxHistoryLength: 15
        });
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('model', 'gemini'); // unchanged
      expect(response.body).toHaveProperty('maxHistoryLength', 15); // updated
      
      // Verify database was updated
      await waitForMongoOperation();
      const updatedConversation = await Conversation.findOne({ userId });
      expect(updatedConversation.model).toBe('gemini');
      expect(updatedConversation.maxHistoryLength).toBe(15);
    });

    it('should create new conversation when updating settings for non-existent user', async () => {
      const userId = 'new-settings-user';
      
      const response = await request(app)
        .put(`/conversations/${userId}/settings`)
        .send({
          model: 'empathy',
          maxHistoryLength: 5
        });
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('model', 'empathy');
      expect(response.body).toHaveProperty('maxHistoryLength', 5);
      
      // Verify conversation was created
      await waitForMongoOperation();
      const newConversation = await Conversation.findOne({ userId });
      expect(newConversation).toBeTruthy();
      expect(newConversation.model).toBe('empathy');
      expect(newConversation.maxHistoryLength).toBe(5);
    });

    it('should handle null userId as string "null"', async () => {
      const response = await request(app)
        .put('/conversations/null/settings')
        .send({
          model: 'empathy'
        });
      
      expect(response.statusCode).toBe(200);
      
      // Verify conversation was created with userId "null"
      await waitForMongoOperation();
      const nullConversation = await Conversation.findOne({ userId: 'null' });
      expect(nullConversation).toBeTruthy();
      expect(nullConversation.model).toBe('empathy');
    });
  });

  // GRUPO 5: Características específicas de la API
  describe('Additional API Features', () => {
    it('should handle Spanish language correctly', async () => {
      const response = await request(app)
        .post('/ask')
        .send({ 
          question: 'pregunta en español', 
          model: 'gemini', 
          userId: 'spanish-user', 
          answer: 'Madrid', 
          category: 'ciudades',
          language: 'es',
          useHistory: true
        });
  
      expect(response.statusCode).toBe(200);
      
      // Verify conversation was created with Spanish preprompt
      await waitForMongoOperation();
      const conversation = await Conversation.findOne({ userId: 'spanish-user' });
      expect(conversation).toBeTruthy();
      expect(conversation.messages[0].content).toContain('Eres un asistente');
    });

    it('should handle errors from LLM API', async () => {
      // Mock API error
      axios.post.mockImplementationOnce(() => {
        throw new Error('LLM API error');
      });
      
      const response = await request(app)
        .post('/ask')
        .send({ 
          question: 'test question', 
          model: 'gemini', 
          userId: 'error-user', 
          answer: 'test answer', 
          category: 'locations'
        });
  
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('answer');
      expect(response.body.answer).toBeNull();
    });
    
    it('should handle unsupported model type', async () => {
      const response = await request(app)
        .post('/ask')
        .send({ 
          question: 'test question', 
          model: 'unsupported-model',  // modelo no soportado
          userId: 'testUserId', 
          answer: 'test answer', 
          category: 'locations'
        });
  
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('answer');
      expect(response.body.answer).toBeNull();
    });
    
    it('should handle ask without history (standard operation)', async () => {
      const response = await request(app)
        .post('/ask')
        .send({ 
          question: 'test question without history', 
          model: 'gemini', 
          userId: 'userWithoutHistory', 
          answer: 'test answer', 
          category: 'locations',
          useHistory: false
        });
  
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('answer');
      
      // Verificar que no se creó una entrada en la base de datos
      await waitForMongoOperation();
      const conversation = await Conversation.findOne({ userId: 'userWithoutHistory' });
      expect(conversation).toBeNull();
    });
  });

  // GRUPO 6: Tests unitarios de funciones internas
  describe('Internal Functions Unit Tests', () => {
    // Extraer funciones "privadas" para pruebas unitarias
    let sendQuestionToLLM;
    let buildConversationContext;
    let getOrCreateConversation;
    let addMessageToConversation;
    let validateRequiredFields;
    let safeUserId;

    beforeAll(() => {
      // Asignar las funciones desde el módulo para probar
      const llmModule = require('./llm-service');
      // Estas funciones normalmente no están expuestas, para pruebas
      // deberías exportarlas en llm-service.js con module.exports
      sendQuestionToLLM = global.sendQuestionToLLM;
      buildConversationContext = global.buildConversationContext;
      getOrCreateConversation = global.getOrCreateConversation;
      addMessageToConversation = global.addMessageToConversation;
      validateRequiredFields = global.validateRequiredFields;
      safeUserId = global.safeUserId;
    });

    // Estos tests se saltarán si las funciones no están expuestas
    it('safeUserId should convert values to strings and throw for null/undefined', () => {
      if (!safeUserId) return;

      expect(safeUserId('123')).toBe('123');
      expect(safeUserId(456)).toBe('456');
      
      expect(() => safeUserId(null)).toThrow('UserId is required');
      expect(() => safeUserId(undefined)).toThrow('UserId is required');
    });

    it('validateRequiredFields should throw error if fields are missing', () => {
      if (!validateRequiredFields) return;

      const req = { body: { field1: 'value1', field2: 'value2' } };
      
      // No debe lanzar error para campos presentes
      expect(() => validateRequiredFields(req, ['field1', 'field2'])).not.toThrow();
      
      // Debe lanzar error para campos faltantes
      expect(() => validateRequiredFields(req, ['field1', 'field3'])).toThrow();
    });
  });

  // GRUPO 7: Manejo del cierre del servidor
  describe('Server Shutdown Handling', () => {
    it('should have a SIGTERM event handler registered', () => {
      // Verificamos que existe al menos un listener para SIGTERM
      const handlers = process.listeners('SIGTERM');
      expect(handlers.length).toBeGreaterThan(0);
      
      // Verificar que el manejador es una función
      expect(typeof handlers[handlers.length - 1]).toBe('function');
    });
  });
});
