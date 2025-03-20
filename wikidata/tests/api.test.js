const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const express = require("express");
const apiRoutes = require("../api");
const { Question,Game } = require("../model/wikidataModel");

let mongoServer;
let app;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    // Crear una instancia de Express y usar las rutas de API
    app = express();
    app.use(express.json());
    app.use("/api", apiRoutes);
});

afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
});

describe("API Endpoints", () => {
    beforeEach(async () => {
        await Question.deleteMany();
    });

    it("should return a question with options on GET /api/question", async () => {
        await Question.create({
            statements: ["¿Quién pintó 'La Mona Lisa'?"],
            answer: "Leonardo da Vinci",
            image: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Mona_Lisa.jpg",
            category: "Arte"
        });

        const response = await request(app).get("/api/question");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("question");
        expect(response.body).toHaveProperty("image");
        expect(response.body).toHaveProperty("options");
        console.log(response.body.options);
        expect(response.body.options.length).toBe(4);
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

    it("should verify correct and incorrect answers and update stats on POST /api/verify", async () => {
        await Question.create({
            statements: ["¿Quién pintó 'La Mona Lisa'?"],
            answer: "Leonardo da Vinci",
            image: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Mona_Lisa.jpg",
            category: "Arte"
        });

        const response = await request(app).post("/api/game/start").send({
            userId: "user123"
        });

        const correctResponse = await request(app).post("/api/verify").send({
            userId: "user123",
            question: "¿Quién pintó 'La Mona Lisa'?",
            selectedOption: "Leonardo da Vinci"
        });

        expect(correctResponse.status).toBe(200);
        expect(correctResponse.body.isCorrect).toBe(true);

        const incorrectResponse = await request(app).post("/api/verify").send({
            userId: "user123",
            question: "¿Quién pintó 'La Mona Lisa'?",
            selectedOption: "Pablo Picasso"
        });

        expect(incorrectResponse.status).toBe(200);
        expect(incorrectResponse.body.isCorrect).toBe(false);

        const games = await Game.find({ userId: "user123" });
        expect(games[1].correct).toBe(1);
        expect(games[1].wrong).toBe(1);
    });

    it("should end the game and calculate duration on POST /api/game/end", async () => {
        await Game.create({ userId: "user123", correct: 2, wrong: 1, duration: 0, createdAt: new Date(Date.now() - 50000) });

        const response = await request(app).post("/api/game/end").send({
            userId: "user123"
        });

        expect(response.status).toBe(200);


        const games = await Game.find({ userId: "user123" });
        expect(games[2].duration).toBeGreaterThanOrEqual(5); 
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
});