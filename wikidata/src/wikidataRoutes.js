require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const repository = require("./repositories/wikidataRepository");
const service = require("./services/wikidataService");
const cors = require('cors');
const { Game } = require("../src/model/wikidataModel");

// Get host and webapp port from environment variables or use defaults
const deployHost = process.env.DEPLOY_HOST || 'localhost';
const webappPort = process.env.WEBAPP_PORT || '3000';
const corsOrigin = `http://${deployHost}:${webappPort}`;

console.log(`CORS origin set to: ${corsOrigin}`);

app.use(cors({
  origin: corsOrigin,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/wikidatadb";

repository.init(mongoose, mongoUri);

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server listening in port http://localhost:${PORT}`);
});

// Configuring the route to serve the questions to your frontend. 
// This route will return n questions from the database based on the specified category and delete them from the database.
// Example: http://localhost:3001/wikidata/question/Lugares/10
app.get("/wikidata/question/:category/:number", async (req, res) => {
    const category= req.params.category;
    const n = req.params.number;
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
app.post("/wikidata/verify", async (req, res) => {
    console.log("/wikidata/verify route hit with body:", req.body);
    const { userId, userOption, answer } = req.body; 
    try {
        const isCorrect = await service.checkCorrectAnswer(userOption, answer); 
        let games = await Game.find({ userId });
        let game = games[games.length-1];
        if (!game) {
            return res.status(404).json({ error: "No active game found for this user" });
        }
        if (isCorrect) {
            game.correct += 1;
        } else {
            game.wrong += 1;
        }
        await game.save();

        res.json({
            isCorrect: isCorrect, 
            correctCount: game.correct,
            wrongCount: game.wrong
        });
    } catch (error) {
        console.error("Error verifying the answer:", error);
        res.status(500).json({ error: "Error verifying the answer" });
    }
});

// Configuring the route to clear all the questions from the database.
// Example: http://localhost:3001/wikidata/clear
app.get("/wikidata/clear", async (req, res) => {
    try {
        await service.clearAllQuestions();
        res.json({ message: "Questions cleared successfully" });
    } catch (error) {
        console.error("Error clearing the questions:", error);
        res.status(500).json({ error: "Error clearing the questions" });
    }
});

// Configuring the route to start a new game.
// This route will create a new game in the database.
// Example: http://localhost:3001/game/start
app.post('/game/start', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }

        await Game.create({
            userId,
            correct: 0,
            wrong: 0,
            duration: 0,
            createdAt: new Date()
        });

        return res.json({ message: "Game started successfully" });

    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// Configuring the route to end the game.
// This route will end the game and calculate the duration of the game.
// Example: http://localhost:3001/game/end
app.post('/game/end', async (req, res) => {
    try {
        const { userId, correct, wrong } = req.body;

        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }

        let games = await Game.find({ userId });
        let game = games[games.length - 1];

        if (!game) {
            return res.status(404).json({ error: "No active game found for this user" });
        }

        const now = new Date();
        const durationInSeconds = Math.floor((now - game.createdAt) / 1000);
        game.duration = durationInSeconds;
        game.correct = correct;
        game.wrong = wrong;
        game.isCompleted = (correct + wrong === 10);

        await game.save();

        res.json({
            correct: game.correct,
            wrong: game.wrong,
            duration: game.duration,
            isCompleted: game.isCompleted
        });

    } catch (error) {
        console.error("Error al finalizar el juego:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Configuring the route to update the game statistics.
// This route will return the statistics of the games played by the user.
// Example: http://localhost:3001/game/statistics?userId=123
app.get('/game/statistics', async (req, res) => {
     try {
         const { userId } = req.query;
 
         if (!userId) {
             return res.status(400).json({ error: "userId is required" });
         }
 
         const games = await Game.find({ userId, isCompleted: true });
 
         if (!games || games.length === 0) {
         }else{
            const statistics = games.map(game => ({
                correct: game.correct,
                wrong: game.wrong,
                duration: game.duration,
                createdAt: new Date(game.createdAt).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                })
            }));
    
            res.json(statistics);
         }
     } catch (error) {
         console.error("Error fetching game statistics:", error);
         res.status(500).json({ error: "Server error" });
     }
 });

