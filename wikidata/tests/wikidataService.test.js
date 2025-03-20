const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

const { fetchQuestionsFromWikidata } = require('../wikidataService');
const wikidataRepository = require('../repositories/wikidataRepository');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    wikidataRepository.init(mongoose, mongoUri);
});

afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
});

describe('Wikidata Service', () => {
    beforeEach(async () => {
        await wikidataRepository.deleteQuestions(); // ✅ Usar repositorio para limpiar BD
    });

    it('should fetch questions from Wikidata and store them in MongoDB', async () => {
        const questions = await fetchQuestionsFromWikidata();
        
        expect(Array.isArray(questions)).toBe(true);
        expect(questions.length).toBeGreaterThan(0);

        await wikidataRepository.insertQuestions(questions);

        const questionsInDb = await wikidataRepository.getQuestions(questions[0].category, 10);
        expect(questionsInDb.length).toBeGreaterThan(0);

        questionsInDb.forEach((q) => {
            expect(q).toHaveProperty('statements');
            expect(q).toHaveProperty('answer');
            expect(q).toHaveProperty('image');
            expect(q).toHaveProperty('category');
        });
    }, 20000);
});
