const answers = require("../model/wikidataFakeAnswers")

const fakeAnswers = {
    /**
     * Function to generate fake answers for the questions.
     * @param {String} correctAnswer - The correct answer of the question.
     * @param {String} category - The category of the question.
     * @param {String} lang - The language of the question. Default is 'es' (Spanish).
     * @returns {Array} - An array of fake answers. It contains 3 fake answers.
     */
    getFakeAnswers: function (correctAnswer, category, lang = 'es') {
        console.log(`Generating fake answers for category: ${category}, language: ${lang}`);
        let fakeAnswersSet = new Set();
        const categoryAnswers = answers.find(a => a.category === category);
        
        if (!categoryAnswers) {
            console.error(`Category ${category} not found in the fake answers`);
            return [];
        }

        const answersInLang = categoryAnswers.answers[lang];
        console.log(`Answers in ${lang}:`, answersInLang);

        if(!answersInLang){
            console.error(`No answers found for language: ${lang}`);
            return [];
        }

        if(answersInLang.length === 0){
            console.error(`No answers found for category: ${category} in language: ${lang}`);
            return [];

        }

        while (fakeAnswersSet.size < 3) {
            let randomAnswer = answersInLang[Math.floor(Math.random() * answersInLang.length)];
            if (randomAnswer !== correctAnswer) {

                fakeAnswersSet.add(randomAnswer);
            }
        }

        return Array.from(fakeAnswersSet);
    }
};

module.exports = fakeAnswers;