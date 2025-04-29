const request = require('supertest');
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const YAML = require('yaml');

// Mock de las dependencias
jest.mock('axios');
jest.mock('fs');
jest.mock('yaml');

// Importar el app después de los mocks
const app = require('./api-service');

describe('API Service', () => {
  beforeAll(() => {
    process.env.AUTH_SERVICE_URL = 'http://localhost:8002';
    process.env.USER_SERVICE_URL = 'http://localhost:8001';
    process.env.WIKIDATA_SERVICE_URL = 'http://localhost:3001';
    process.env.WEBAPP_URL = 'http://localhost:3000';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Health Check', () => {
    it('should return status OK', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'OK' });
    });
  });

  describe('Questions Endpoints', () => {
    it('/questions should return questions from wikidata service', async () => {
      const mockQuestions = [{ id: 1, question: 'Test question' }];
      axios.get.mockResolvedValue({ data: mockQuestions });

      const response = await request(app).get('/questions');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockQuestions);
      expect(axios.get).toHaveBeenCalledWith('http://localhost:3001/questions');
    });

    it('/questions should handle errors gracefully', async () => {
      axios.get.mockRejectedValue({ response: { status: 404, data: { error: 'Not found' } } });

      const response = await request(app).get('/questions');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Not found' });
    });

    it('/questions/:category should return category questions', async () => {
      const mockQuestions = [{ id: 1, question: 'Geography question' }];
      axios.get.mockResolvedValue({ data: mockQuestions });

      const response = await request(app).get('/questions/geography');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockQuestions);
      expect(axios.get).toHaveBeenCalledWith('http://localhost:3001/questions/geography');
    });

    it('/questions/:category should handle errors', async () => {
      axios.get.mockRejectedValue({ response: { status: 500, data: { error: 'Server error' } } });

      const response = await request(app).get('/questions/geography');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Server error' });
    });
  });

  describe('User Endpoints', () => {
    it('/users should return user list', async () => {
      const mockUsers = [{ username: 'user1' }, { username: 'user2' }];
      axios.get.mockResolvedValue({ data: mockUsers });

      const response = await request(app).get('/users');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsers);
      expect(axios.get).toHaveBeenCalledWith('http://localhost:8001/listUsers');
    });

    it('/users should handle error', async () => {
      axios.get.mockRejectedValue({ response: { status: 503, data: { error: 'Service unavailable' } } });

      const response = await request(app).get('/users');

      expect(response.status).toBe(503);
      expect(response.body).toEqual({ error: 'Service unavailable' });
    });

    it('/users/:username should return user details', async () => {
      const mockUser = { username: 'testuser', friends: [] };
      axios.get.mockResolvedValue({ data: mockUser });

      const response = await request(app).get('/users/testuser');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
      expect(axios.get).toHaveBeenCalledWith('http://localhost:8001/user/testuser');
    });

    it('/users/:username should handle errors', async () => {
      axios.get.mockRejectedValue({ response: { status: 404, data: { error: 'User not found' } } });

      const response = await request(app).get('/users/unknown');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'User not found' });
    });
  });

  describe('OpenAPI Configuration', () => {
    it('should configure Swagger if file exists', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('openapi content');
      YAML.parse.mockReturnValue({ openapi: '3.0.0' });
  
      jest.isolateModules(() => {
        require('./api-service');
      });
  
      expect(fs.existsSync).toHaveBeenCalledWith('./openapi.yaml');
      expect(fs.readFileSync).toHaveBeenCalledWith('./openapi.yaml', 'utf8');
      expect(YAML.parse).toHaveBeenCalled();
    });
  
    it('should skip Swagger if file does not exist', () => {
      fs.existsSync.mockReturnValue(false);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  
      jest.isolateModules(() => {
        require('./api-service');
      });
  
      expect(fs.existsSync).toHaveBeenCalledWith('./openapi.yaml');
      expect(consoleSpy).toHaveBeenCalledWith("Not configuring OpenAPI. Configuration file not present.");
  
      consoleSpy.mockRestore();
    });
  });

  describe('CORS Configuration', () => {
    it('should include CORS headers', async () => {
      const response = await request(app).options('/users'); // Request de tipo OPTIONS
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });
  });
  
  describe('Server bootstrap', () => {
    it('should start the server without crashing', () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      require('./server');
      expect(true).toBe(true); 
  
      console.log.mockRestore();
    });
  });
  
  

});
