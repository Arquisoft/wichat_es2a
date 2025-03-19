const express = require("express");
const app = express();
const mongoose = require("mongoose");
const service = require("./services/wikidataService");

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server listening in port http://localhost:${PORT}`);
});

// Configuring the route to serve the questions to your frontend. 
// This route will return a random question from the database based on the specified category.
// Example: http://localhost:3001/wikidata/question?category=Lugares
app.get("/wikidata/question", async (req, res) => {
    const { category } = req.query;
    try {
        const question = await service.getQuestion(category);
        res.json(question);
    } catch (error) {
        console.error("Error getting the questions:", error);
        res.status(500).json({ error: "Error getting the questions from Wikidata" });
    }
});

// Configuring the route to check if the user's answer is correct.
// This route will receive the question id, the user's answer, and the correct answer.
// It will delete the question from the database after checking the answer.
// Example: http://localhost:3001/wikidata/verify?id=123&userOption=Option1&answer=CorrectAnswer
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
