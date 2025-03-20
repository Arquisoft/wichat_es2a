const express = require("express");
const app = express();
const mongoose = require("mongoose");
const repository = require("./repositories/wikidataRepository");
const service = require("./services/wikidataService");

const mongoUri = process.env.MONGODB_URI || "mongodb://mongodb-wichat_es2a:27017/wikidatadb";

repository.init(mongoose, mongoUri);

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server listening in port http://localhost:${PORT}`);
});

// Configuring the route to serve the questions to your frontend. 
// This route will return n questions from the database based on the specified category and delete them from the database.
// Example: http://localhost:3001/wikidata/question?category=Lugares&n=10
app.get("/wikidata/question", async (req, res) => {
    const { category, n } = req.query;
    try {
        const questions = await service.getQuestions(category, n);
        service.deleteQuestions(questions);
        res.json(questions);
    } catch (error) {
        console.error("Error getting the questions:", error);
        res.status(500).json({ error: "Error getting the questions from Wikidata" });
    }
});

// Configuring the route to check if the user's answer is correct.
// This route will receive the user's answer, and the correct answer.
// Example: http://localhost:3001/wikidata/verify?userOption=Option1&answer=CorrectAnswer
app.get("/wikidata/verify", async (req, res) => {
    const { id, userOption, answer } = req.query;
    try {
        const isCorrect = await service.checkCorrectAnswer(id, userOption, answer);
        res.json({ correct: isCorrect });
    } catch (error) {
        console.error("Error verifying the answer:", error);
        res.status(500).json({ error: "Error verifying the answer" });
    }
});

app.get("/wikidata/clear", async (req, res) => {
    try {
        await service.clearAllQuestions();
        res.json({ message: "Questions cleared successfully" });
    } catch (error) {
        console.error("Error clearing the questions:", error);
        res.status(500).json({ error: "Error clearing the questions" });
    }
});
