const express = require('express');
const { Question } = require('./model/wikidataModel');
const mongoose = require('mongoose');

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
        const { question, selectedOption } = req.body;

        if (!question || !selectedOption) {
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

        res.json({
            question: selectedQuestion.statements[0],
            selectedOption: selectedOption,
            correctAnswer: selectedQuestion.answer,
            isCorrect: isCorrect,
            options: options
        });

    } catch (error) {
        console.error("Error verifying response:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
