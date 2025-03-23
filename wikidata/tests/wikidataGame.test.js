const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const { Game } = require("../src/model/wikidataModel");
const wikidataRoutes = require("../src/wikidataRoutes");

let mongoServer;
let app;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    app = express();
    app.use(cors()); // Enable CORS middleware
    app.use(express.json());
    app.use("/api", wikidataRoutes); // Use the routes from wikidataRoutes
});

afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
});

describe("Game API Endpoints", () => {
    beforeEach(async () => {
        await Game.deleteMany();
    });

    it("should start a game on POST /api/game/start", async () => {
        const response = await request(app).post("/api/game/start").send({
            userId: "user123"
        });

        expect(response.status).toBe(200);

        const games = await Game.find({ userId: "user123" });
        expect(games.length).toBe(1);
        expect(games[0].correct).toBe(0);
        expect(games[0].wrong).toBe(0);
        expect(games[0].duration).toBe(0);
    });

    it("should end a game and calculate duration on POST /api/game/end", async () => {
        const startTime = new Date(Date.now() - 60000); 
        await Game.create({ userId: "testUser", correct: 2, wrong: 1, duration: 0, createdAt: startTime });

        const response = await request(app).post("/api/game/end").send({
            userId: "testUser"
        });

        expect(response.status).toBe(200);
        expect(response.body.duration).toBeGreaterThanOrEqual(60);

        const game = await Game.findOne({ userId: "testUser" });
        expect(game.duration).toBeGreaterThanOrEqual(60);
    });

    it("should return game statistics on GET /api/game/statistics", async () => {
        await Game.create({ userId: "user234", correct: 3, wrong: 2, duration: 120, createdAt: new Date() });
        await Game.create({ userId: "user234", correct: 5, wrong: 1, duration: 300, createdAt: new Date() });

        const response = await request(app).get("/api/game/statistics").query({ userId: "user234" });

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
        expect(response.body[0]).toHaveProperty("correct", 3);
        expect(response.body[0]).toHaveProperty("wrong", 2);
        expect(response.body[0]).toHaveProperty("duration", 120);
        expect(response.body[1]).toHaveProperty("correct", 5);
        expect(response.body[1]).toHaveProperty("wrong", 1);
        expect(response.body[1]).toHaveProperty("duration", 300);
    });

    it("should update game statistics correctly on POST /api/wikidata/verify", async () => {
        await Game.create({ userId: "testUser", correct: 0, wrong: 0, duration: 0 });

        const correctResponse = await request(app).post("/api/wikidata/verify").send({
            userId: "testUser",
            question: "¿Quién pintó 'La Mona Lisa'?",
            userOption: "Leonardo da Vinci",
            answer: "Leonardo da Vinci" 
        });

        expect(correctResponse.status).toBe(200);
        expect(correctResponse.body.isCorrect).toBe(true);

        const incorrectResponse = await request(app).post("/api/wikidata/verify").send({
            userId: "testUser",
            question: "¿Quién pintó 'La Mona Lisa'?",
            userOption: "Pablo Picasso",
            answer: "Leonardo da Vinci" 
        });

        expect(incorrectResponse.status).toBe(200);
        expect(incorrectResponse.body.isCorrect).toBe(false);

        const game = await Game.findOne({ userId: "testUser" });
        expect(game.correct).toBe(1);
        expect(game.wrong).toBe(1);
    });
});