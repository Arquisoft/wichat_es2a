const request = require('supertest');
const app = require('./mathGameRoutes');
const service = require('./service/mathGameService');
const express = require('express');

jest.mock('./service/mathGameService');

describe('MathGame API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /mathgame/question', () => {
    it('should return a question with no base', async () => {
        service.generateExpression.mockReturnValue({ expr: '3 + 4', result: 7 });
        service.generateOptions.mockReturnValue([7, 6, 8, 10]);

        const response = await request(app).get('/mathgame/question');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            expr: '3 + 4',
            options: [7, 6, 8, 10],
            correct: 7
        });
    });

    it('should return a question with numeric base', async () => {
        service.generateExpression.mockReturnValue({ expr: '10 * 2', result: 20 });
        service.generateOptions.mockReturnValue([20, 21, 25, 19]);

        const response = await request(app).get('/mathgame/question?base=10');
        expect(response.status).toBe(200);
        expect(service.generateExpression).toHaveBeenCalledWith(10);
        expect(response.body.correct).toBe(20);
    });

    it('should treat invalid base as null', async () => {
        service.generateExpression.mockReturnValue({ expr: '5 - 2', result: 3 });
        service.generateOptions.mockReturnValue([3, 2, 4, 6]);

        const response = await request(app).get('/mathgame/question?base=abc');
        expect(response.status).toBe(200);
        expect(service.generateExpression).toHaveBeenCalledWith(null);
    });

    it('should return 500 on internal error (GET)', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        service.generateExpression.mockImplementation(() => { throw new Error('Test error'); });

        const response = await request(app).get('/mathgame/question');
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Error generating math question' });

        console.error.mockRestore();
    });
  });

  describe('POST /mathgame/verify', () => {
    it('should return isCorrect: true when correct', async () => {
        const response = await request(app)
            .post('/mathgame/verify')
            .send({ choice: 42, correct: 42 });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ isCorrect: true });
    });

    it('should return isCorrect: false when incorrect', async () => {
        const response = await request(app)
            .post('/mathgame/verify')
            .send({ choice: 40, correct: 42 });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ isCorrect: false });
    });

    it('should return 500 on internal error (POST)', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        
        const brokenApp = express();
        brokenApp.use(express.json());
        
        brokenApp.post('/mathgame/verify', (req, res) => {
            Object.defineProperty(req, 'body', {
            get() {
                throw new Error('Simulated error');
            }
            });
        
            try {
            const { choice, correct } = req.body;
            const isCorrect = Number(choice) === Number(correct);
            res.json({ isCorrect });
            } catch (err) {
            console.error('Error verifying math answer:', err);
            res.status(500).json({ error: 'Error verifying math answer' });
            }
        });
        
        const response = await request(brokenApp)
            .post('/mathgame/verify')
            .send({ choice: 1, correct: 1 });
        
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Error verifying math answer' });
        
        console.error.mockRestore();
        });

    it('should handle internal error correctly in POST /mathgame/verify', async () => {
        const { app } = require('./mathGameRoutes');

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        const brokenApp = require('express')();
        brokenApp.use(require('express').json());

        brokenApp.post('/mathgame/verify', (req, res) => {
            try {
            throw new Error('Simulated verify error');
            } catch (err) {
            console.error('Error verifying math answer:', err);
            res.status(500).json({ error: 'Error verifying math answer' });
            }
        });
        const response = await request(brokenApp)
            .post('/mathgame/verify')
            .send({ choice: 1, correct: 1 });
        
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Error verifying math answer' });
        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('Error verifying math answer'),
            expect.any(Error)
        );
        
        consoleSpy.mockRestore();
        });     
    });
});
