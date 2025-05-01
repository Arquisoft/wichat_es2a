const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');

jest.mock('mongoose', () => ({
    connect: jest.fn().mockResolvedValue({}),
    connection: {}
  }));
  


jest.mock('mongoose');
jest.mock('../src/repositories/wikidataRepository');
jest.mock('../src/services/wikidataService');
jest.mock('../src/model/wikidataModel', () => ({
  Game: {
    find: jest.fn(),
    create: jest.fn()
  }
}));

const repository = require('../src/repositories/wikidataRepository');
const service = require('../src/services/wikidataService');
const { Game } = require('../src/model/wikidataModel');

const app = require('../src/wikidataRoutes'); 

beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('MongoDB Connection', () => {
    it('should connect to MongoDB without throwing', async () => {
      mongoose.connect.mockResolvedValueOnce();
      expect(mongoose.connect).toHaveBeenCalled();
    });
  });

  describe('GET /wikidata/question/:category/:number', () => {
    it('should return questions successfully', async () => {
      service.getQuestions.mockResolvedValue([{ id: 1 }]);
      const response = await request(app).get('/wikidata/question/Lugares/5');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([{ id: 1 }]);
    });
  
    it('should use defaultConfig if number is invalid', async () => {
      jest.mock('../src/utils/config', () => ({
        defaultConfig: { numQuestions: 3 }
      }));
  
      service.getQuestions.mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const response = await request(app).get('/wikidata/question/Lugares/abc');
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);
    });
  
    it('should handle error in getQuestions', async () => {
      service.getQuestions.mockRejectedValueOnce(new Error('Failed'));
      const response = await request(app).get('/wikidata/question/Lugares/5');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Error getting the questions from Wikidata" });
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('POST /wikidata/verify', () => {
    it('should verify answer correctly', async () => {
      service.checkCorrectAnswer.mockResolvedValue(true);
      Game.find.mockResolvedValue([{ correct: 0, wrong: 0, save: jest.fn() }]);
      
      const response = await request(app)
        .post('/wikidata/verify')
        .send({ userId: 'user123', userOption: 'A', answer: 'A' });
  
      expect(response.status).toBe(200);
      expect(response.body.isCorrect).toBe(true);
    });
  
    it('should return 404 if no active game found', async () => {
      service.checkCorrectAnswer.mockResolvedValue(true);
      Game.find.mockResolvedValue([]);
  
      const response = await request(app)
        .post('/wikidata/verify')
        .send({ userId: 'user123', userOption: 'A', answer: 'A' });
  
      expect(response.status).toBe(404);
      expect(response.body.error).toBe("No active game found for this user");
    });
  
    it('should handle error in verify', async () => {
      service.checkCorrectAnswer.mockRejectedValueOnce(new Error('Failed'));
      const response = await request(app)
        .post('/wikidata/verify')
        .send({ userId: 'user123', userOption: 'A', answer: 'A' });
  
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Error verifying the answer" });
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('GET /wikidata/clear', () => {
    it('should clear all questions', async () => {
      service.clearAllQuestions.mockResolvedValue();
      const response = await request(app).get('/wikidata/clear');
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Questions cleared successfully');
    });
  
    it('should handle error clearing questions', async () => {
      service.clearAllQuestions.mockRejectedValue(new Error('Failed'));
      const response = await request(app).get('/wikidata/clear');
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error clearing the questions');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('POST /game/start', () => {
    it('should start a new game', async () => {
      Game.create.mockResolvedValue({});
      const response = await request(app)
        .post('/game/start')
        .send({ userId: 'user123' });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Game started successfully');
    });
  
    it('should return 400 if userId missing', async () => {
      const response = await request(app)
        .post('/game/start')
        .send({});
      expect(response.status).toBe(400);
    });
  
    it('should handle error starting a game', async () => {
      Game.create.mockRejectedValue(new Error('Failed'));
      const response = await request(app)
        .post('/game/start')
        .send({ userId: 'user123' });
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Server error');
    });
  });

  describe('POST /game/end', () => {
    it('should end a game successfully', async () => {
      Game.find.mockResolvedValue([{ createdAt: new Date(), save: jest.fn() }]);
      const response = await request(app)
        .post('/game/end')
        .send({ userId: 'user123', correct: 5, wrong: 3, category: "Test", level: "1", totalQuestions: 10, answered: 8, points: 50 });
      expect(response.status).toBe(200);
      expect(response.body.correct).toBe(5);
    });
  
    it('should return 400 if userId missing', async () => {
      const response = await request(app)
        .post('/game/end')
        .send({});
      expect(response.status).toBe(400);
    });
  
    it('should return 404 if no active game found', async () => {
      Game.find.mockResolvedValue([]);
      const response = await request(app)
        .post('/game/end')
        .send({ userId: 'user123', correct: 5, wrong: 3 });
      expect(response.status).toBe(404);
    });
  
    it('should handle error ending game', async () => {
      Game.find.mockRejectedValue(new Error('Failed'));
      const response = await request(app)
        .post('/game/end')
        .send({ userId: 'user123', correct: 5, wrong: 3 });
      expect(response.status).toBe(500);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('GET /game/statistics', () => {
    it('should return user statistics', async () => {
      Game.find.mockResolvedValue([{ createdAt: new Date(), correct: 2, wrong: 1, duration: 60, category: "Test", level: "1", totalQuestions: 10, answered: 5, points: 50, isCompleted: true }]);
      const response = await request(app)
        .get('/game/statistics')
        .query({ userId: 'user123' });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  
    it('should return 400 if userId missing', async () => {
      const response = await request(app)
        .get('/game/statistics');
      expect(response.status).toBe(400);
    });
  
    it('should return empty array if no completed games', async () => {
      Game.find.mockResolvedValue([]);
      const response = await request(app)
        .get('/game/statistics')
        .query({ userId: 'user123' });
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  
    it('should handle error getting statistics', async () => {
      Game.find.mockRejectedValue(new Error('Failed'));
      const response = await request(app)
        .get('/game/statistics')
        .query({ userId: 'user123' });
      expect(response.status).toBe(500);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('GET /questions', () => {
    it('should return all questions', async () => {
      repository.getAllQuestions.mockResolvedValue([{ id: 1 }]);
      const response = await request(app).get('/questions');
      expect(response.status).toBe(200);
    });
  
    it('should handle error getting all questions', async () => {
      repository.getAllQuestions.mockRejectedValue(new Error('Failed'));
      const response = await request(app).get('/questions');
      expect(response.status).toBe(500);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('GET /questions/:category', () => {
    it('should return questions from a category', async () => {
      repository.getAllQuestionsFromCategory.mockResolvedValue([{ id: 1 }]);
      const response = await request(app).get('/questions/TestCategory');
      expect(response.status).toBe(200);
    });
  
    it('should handle error getting questions from category', async () => {
      repository.getAllQuestionsFromCategory.mockRejectedValue(new Error('Failed'));
      const response = await request(app).get('/questions/TestCategory');
      expect(response.status).toBe(500);
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  
  
  
  
  
  
  
  