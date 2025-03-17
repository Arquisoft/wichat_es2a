const request = require('supertest');
const axios = require('axios');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI = mongoUri;
  app = require('./llm-service');
});

afterAll(async () => {
  app.close();
  await mongoServer.stop();
});

jest.mock('axios');

describe('LLM Service', () => {
  // Mock responses from external services
  axios.post.mockImplementation((url, data) => {
    if (url.startsWith('https://generativelanguage')) {
      return Promise.resolve({ data: { candidates: [{ content: { parts: [{ text: 'llmanswer' }] } }] } });
    } else if (url.endsWith('https://empathyai')) {
      return Promise.resolve({ data: { answer: 'llmanswer' } });
    }
  });

  // Test /ask endpoint
  it('the llm should reply', async () => {
    const response = await request(app)
      .post('/ask')
      .send({ question: 'a question', model: 'gemini', userId: 'userId', answer:'answer'});

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('answer');
    expect(response.body.answer).not.toEqual(null);
  });

});