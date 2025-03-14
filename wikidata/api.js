const express = require('express');
const { Question } = require('./wikidataModel');
const mongoose = require('mongoose');

const router = express.Router();

router.get('/question', async (req, res) => {
    try {
        const question = await Question.aggregate([{ $sample: { size: 1 } }]);

        if (question.length === 0) {
            return res.status(404).json({ error: "No questions available" });
        }

        const selectedQuestion = question[0];

        const incorrectAnswers = await Question.aggregate([
            { $match: { category: selectedQuestion.category, answer: { $ne: selectedQuestion.answer } } },
            { $sample: { size: 3 } },
            { $project: { _id: 0, answer: 1 } }
        ]);

        let options = incorrectAnswers.map(opt => opt.answer);
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

// Verificar si la respuesta del usuario es correcta
router.post('/verify', async (req, res) => {
    try {
        const { question, selectedOption } = req.body;

        if (!question || !selectedOption) {
            return res.status(400).json({ error: "Faltan datos en la solicitud" });
        }

        // Buscar la pregunta en la base de datos
        const foundQuestion = await Question.findOne({ statements: question });

        if (!foundQuestion) {
            return res.status(404).json({ error: "Pregunta no encontrada" });
        }

        // Obtener respuestas incorrectas aleatorias
        const incorrectAnswers = await Question.aggregate([
            { $match: { category: foundQuestion.category, answer: { $ne: foundQuestion.answer } } },
            { $sample: { size: 3 } },
            { $project: { _id: 0, answer: 1 } }
        ]);

        // Construir opciones y mezclarlas
        let options = incorrectAnswers.map(opt => opt.answer);
        options.push(foundQuestion.answer);
        options = options.sort(() => Math.random() - 0.5);

        // Comparar la opción seleccionada con la respuesta correcta
        const isCorrect = foundQuestion.answer === selectedOption;

        res.json({
            question: foundQuestion.statements[0],
            selectedOption: selectedOption,
            correctAnswer: foundQuestion.answer,
            isCorrect: isCorrect,
            options: options // ✅ Devuelve las 4 opciones para el frontend
        });
    } catch (error) {
        console.error("Error verificando la respuesta:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});

module.exports = router;
