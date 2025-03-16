const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const express = require("express");
const apiRoutes = require("../api");
const { Question } = require("../model/wikidataModel");

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

    it("should verify correct and incorrect answers on POST /api/verify", async () => {
        await Question.create({
            statements: ["¿Quién pintó 'La Mona Lisa'?"],
            answer: "Leonardo da Vinci",
            image: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Mona_Lisa.jpg",
            category: "Arte"
        });

        const correctResponse = await request(app).post("/api/verify").send({
            question: "¿Quién pintó 'La Mona Lisa'?",
            selectedOption: "Leonardo da Vinci"
        });
        expect(correctResponse.status).toBe(200);
        expect(correctResponse.body.isCorrect).toBe(true);

        const incorrectResponse = await request(app).post("/api/verify").send({
            question: "¿Quién pintó 'La Mona Lisa'?",
            selectedOption: "Pablo Picasso"
        });
        expect(incorrectResponse.status).toBe(200);
        expect(incorrectResponse.body.isCorrect).toBe(false);
    });
});