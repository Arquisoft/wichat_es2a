const answers = require("../model/wikidataFakeAnswers")

const fakeAnswers = {
    /**
     * Function to generate fake answers for the questions.
     * @param {String} correctAnswer - The correct answer of the question.
     * @param {String} category - The category of the question.
     * @returns {Array} - An array of fake answers. It contains 3 fake answers.
     */
    getFakeAnswers: function (correctAnswer, category) {
        let fakeAnswersSet = new Set();
        const categoryAnswers = answers.find(a => a.category === category);
        
        if (!categoryAnswers) {
            console.error(`Category ${category} not found in the fake answers`);
            return [];
        }

        while (fakeAnswersSet.size < 3) {
            let randomAnswer = categoryAnswers.answers[Math.floor(Math.random() * categoryAnswers.answers.length)];
            if (randomAnswer !== correctAnswer) {
                fakeAnswersSet.add(randomAnswer);
            }
        }

        return Array.from(fakeAnswersSet);
    }
};

module.exports = fakeAnswers;