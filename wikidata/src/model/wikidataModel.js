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
    username: { type: String, default: "" },
    correct: { type: Number, default: 0 },
    wrong: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    isCompleted: { type: Boolean, default: false },
    category: { type: String, default: "" },
    level: { type: String, default: "" },
    totalQuestions: { type: Number, default: 10 },
    answered: { type: Number, default: 0 },
    points: { type: Number, default: 0 }
});

const Question = mongoose.model('questions', questionSchema);
const Game = mongoose.model('Game', gameSchema);

module.exports = { Question, Game };
