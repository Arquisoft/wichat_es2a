const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    statements: { type: String, required: true },
    answer: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    options: { type: Array, required: true }
});

// const gameSchema = new mongoose.Schema({
//     userId: { type: String, required: true },
//     correct: { type: Number, required: true },
//     wrong: { type: Number, required: true },
//     duration: { type: Number, required: true },
//     createdAt: { type: Date, default: Date.now }
// });

const Question = mongoose.model('questions', questionSchema);
// const Game = mongoose.model('Game', gameSchema);

// module.exports = { Question, Game };
module.exports = { Question };