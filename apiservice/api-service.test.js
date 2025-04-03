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

  afterAll(async () => {
    app.close();
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

    it('/questions/:category should return category questions', async () => {
      const mockQuestions = [{ id: 1, question: 'Geography question' }];
      axios.get.mockResolvedValue({ data: mockQuestions });

      const response = await request(app).get('/questions/geography');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockQuestions);
      expect(axios.get).toHaveBeenCalledWith('http://localhost:3001/questions/geography');
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

    it('/users/:username should return user details', async () => {
      const mockUser = { username: 'testuser', friends: [] };
      axios.get.mockResolvedValue({ data: mockUser });

      const response = await request(app).get('/users/testuser');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
      expect(axios.get).toHaveBeenCalledWith('http://localhost:8001/user/testuser');
    });
  });


});