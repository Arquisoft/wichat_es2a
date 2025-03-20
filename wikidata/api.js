const express = require('express');
const { Question, Game } = require('./model/wikidataModel');
const mongoose = require('mongoose');
jest.setTimeout(10000);

const router = express.Router();

router.get('/question', async (req, res) => {
    try {
        const question = await Question.aggregate([{ $sample: { size: 1 } }]);

        if (question.length === 0) {
            return res.status(404).json({ error: "No questions available" });
        }

        const selectedQuestion = question[0];

        let incorrectAnswers = await Question.aggregate([
            { $match: { category: selectedQuestion.category, answer: { $ne: selectedQuestion.answer } } },
            { $sample: { size: 3 } },
            { $project: { _id: 0, answer: 1 } }
        ]).then(results => results.map(res => res.answer));

        let uniqueOptions = new Set(incorrectAnswers);

        while (uniqueOptions.size < 3) {
            let newAnswer = generateSimilarAnswer(selectedQuestion.category, selectedQuestion.answer);
            if (!uniqueOptions.has(newAnswer)) {
                uniqueOptions.add(newAnswer);
            }
        }

        let options = Array.from(uniqueOptions);
        options.push(selectedQuestion.answer);
        options = options.sort(() => Math.random() - 0.5); 

        res.json({
            question: selectedQuestion.statements[0],
            image: selectedQuestion.image,
            options: options,
            correctAnswer: selectedQuestion.answer
        });

    } catch (error) {
        console.error("Error getting the question:", error);
        res.status(500).json({ error: "Server error" });
    }
});

function generateSimilarAnswer(category, correctAnswer) {
    const similarAnswers = {
        "Lugares": ["Francia", "Alemania", "Brasil", "Japón", "India", "Egipto", "México"],
        "Arte": ["Pablo Picasso", "Claude Monet", "Salvador Dalí", "Andy Warhol", "Jackson Pollock"],
        "Personajes": ["Isaac Newton", "Nikola Tesla", "Albert Einstein", "Galileo Galilei", "Marie Curie"],
        "Ciencia": ["Biología", "Química", "Física", "Matemáticas", "Astronomía"],
        "Cultura": ["Ballet", "Ópera", "Literatura", "Cine", "Música Clásica"]
    };

    if (similarAnswers[category]) {
        let options = similarAnswers[category].filter(ans => ans !== correctAnswer);
        return options[Math.floor(Math.random() * options.length)];
    }

    return `Alternative to ${correctAnswer}`;
}


router.post('/verify', async (req, res) => {
    try {
        const { userId, question, selectedOption } = req.body;

        if (!userId || !question || !selectedOption) {
            return res.status(400).json({ error: "Missing data in the application" });
        }

        const selectedQuestion = await Question.findOne({ statements: question });

        if (!selectedQuestion) {
            return res.status(404).json({ error: "Question not found" });
        }

        const incorrectAnswers = await Question.aggregate([
            { $match: { category: selectedQuestion.category, answer: { $ne: selectedQuestion.answer } } },
            { $sample: { size: 3 } },
            { $project: { _id: 0, answer: 1 } }
        ]);

        let options = incorrectAnswers.map(opt => opt.answer);
        options.push(selectedQuestion.answer);
        options = options.sort(() => Math.random() - 0.5);

        const isCorrect = selectedQuestion.answer === selectedOption;

        let game = await Game.findOne({ userId }).sort({ createdAt: -1 });

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
            question: selectedQuestion.statements[0],
            selectedOption: selectedOption,
            correctAnswer: selectedQuestion.answer,
            isCorrect: isCorrect,
            options: options,
            correctCount: game.correct,
            wrongCount: game.wrong
        });

    } catch (error) {
        console.error("Error verifying response:", error);
        res.status(500).json({ error: "Server error" });
    }});

router.post('/game/start', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }

        await Game.create({
            userId,
            correct: 0,
            wrong: 0,
            duration: 0
        });

        return res.json({ message: "Game started successfully" });

    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

    
router.post('/game/end', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }

        let games = await Game.find({ userId });
        let game = games[games.length-1];

        if (!game) {
            return res.status(404).json({ error: "No active game found for this user" });
        }

        const now = new Date();
        const durationInSeconds = Math.floor((now - game.createdAt) / 1000);
        game.duration = durationInSeconds;

        await game.save();

        res.json({
            correct: game.correct,
            wrong: game.wrong,
            duration: game.duration
        });

    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
router.get('/game/statistics', async (req, res) => {
     try {
         const { userId } = req.query;
 
         if (!userId) {
             return res.status(400).json({ error: "userId is required" });
         }
 
         const games = await Game.find({ userId });
 
         if (!games || games.length === 0) {
             return res.status(404).json({ error: "No games found for this user" });
         }
 
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
     } catch (error) {
         console.error("Error fetching game statistics:", error);
         res.status(500).json({ error: "Server error" });
     }
 });


module.exports = router;
