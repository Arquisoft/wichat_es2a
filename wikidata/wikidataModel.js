const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema(
    {
        statements: [{
            type: String, required: true
        }],
        answer: {
            type: String, required: true,
        },
    },
);

const Question = mongoose.model('questions', questionSchema);

module.exports = { Question, Group };