const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

const { fetchQuestionsFromWikidata } = require('../services/wikidataService');
const { Question } = require('../model/wikidataModel');
const questionRepository = require('../repositories/questionRepository');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    questionRepository.init(mongoose, mongoUri);
});

afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
});

describe('Wikidata Service', () => {
    beforeEach(async () => {
        await Question.deleteMany(); 
    });

    it('should fetch and store questions from Wikidata', async () => {
        const questions = await fetchQuestionsFromWikidata();

        expect(Array.isArray(questions)).toBe(true);
        expect(questions.length).toBeGreaterThan(0);

        await questionRepository.updateQuestionsFromWikidata();

        const questionsInDb = await Question.find();
        expect(questionsInDb.length).toBeGreaterThan(0);

        questionsInDb.forEach((q) => {
            expect(q).toHaveProperty('statements');
            expect(q).toHaveProperty('answer');
            expect(q).toHaveProperty('image');
            expect(q).toHaveProperty('category');
        });
    });
});
