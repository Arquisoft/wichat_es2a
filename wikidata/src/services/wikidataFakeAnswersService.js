const answers = require("../model/wikidataFakeAnswers")

const fakeAnswers = {
    /**
     * Function to generate fake answers for the questions.
     * @param {String} correctAnswer - The correct answer of the question.
     * @param {String} category - The category of the question.
     * @returns {Array} - An array of fake answers. It contains 3 fake answers.
     */
    getFakeAnswers: function (correctAnswer, category) {
        let fakeAnswers = [];
        const categoryAnswers = answers.find(a => a.category === category);
        if (!categoryAnswers) {
            console.error(`Category ${category} not found in the fake answers`);
            return [];
        }
        for (let i = 0; i < 3; i++) {
            if(categoryAnswers.answers[Math.floor(Math.random() * categoryAnswers.answers.length)] !== correctAnswer){
                fakeAnswers.push(categoryAnswers.answers[Math.floor(Math.random() * categoryAnswers.answers.length)]);
            }
        }
        return fakeAnswers;
    }
};

module.exports = fakeAnswers;