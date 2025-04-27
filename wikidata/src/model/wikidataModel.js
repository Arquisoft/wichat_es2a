const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    statements: { type: String, required: true },
    answer: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    options: { type: Array, required: true }
});

const gameSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    correct: { type: Number, required: true },
    wrong: { type: Number, required: true },
    duration: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    isCompleted: { type: Boolean, default: false },
    category: { type: String, required: true },
    level: { type: String, required: true },
    totalQuestions: { type: Number, required: true },
    answered: { type: Number, required: true },
    points: { type: Number, required: true }
});

const Question = mongoose.model('questions', questionSchema);
const Game = mongoose.model('Game', gameSchema);

module.exports = { Question, Game };
