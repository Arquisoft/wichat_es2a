const queries = require('../model/wikidataQueries');
const fakeAnswers = require('../services/wikidataFakeAnswersService');
const repository = require('../repositories/wikidataRepository');
const fetch = require("node-fetch");

const WIKIDATA_SPARQL_URL = "https://query.wikidata.org/sparql";

const service = {
    /**
     * Generate questions from Wikidata.
     * Use the SPARQL query to get the data from Wikidata.
     * Generate the fake answers using the `getFakeAnswers` function.
     * @param {String} category - The category of the questions.
     * @param {String} lang - The language of the questions.
     * @returns {Array} - An array of questions.
     */
    fetchQuestionsFromWikidata: async function(category, lang='es') {
        let questions = [];
        const query = queries.find(q => q.category === category);
        if (!query) {
            console.error(`Category ${category} not found in the queries`);
            return questions;
        }
        const sparqlQuery = query?.sparql[lang] || query?.sparql["es"];
        const statement = query?.statements[lang] || query?.statements["es"];

        const url = `${WIKIDATA_SPARQL_URL}?query=${encodeURIComponent(sparqlQuery)}&format=json&uselang=${lang}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error in Wikidata request: ${response.status}`);
            }

            const data = await response.json();
            const newQuestions = data.results.bindings.map(entry => {
                const correctAnswer = entry.answerLabel ? entry.answerLabel : "Desconocido";
                const options = fakeAnswers.getFakeAnswers(correctAnswer, query.category, lang);
                return {
                    statements: statement,
                    answer: entry.answerLabel ? entry.answerLabel.value : "Desconocido",
                    image: entry.image.value,
                    category: query.category,
                    options: options,
                    lang: lang // idioma de la pregunta
                };
            });
            
            questions = [...questions, ...newQuestions];

        } catch (error) {
            console.error(`Error getting data from the category ${query.category}:`, error);
        }
        return questions;
    },
    /**
     * Get a question from the database.
     * If any question of the category exists in the database, generate new questions from wikidata, insert them into the database and return the first question.
     * @param {String} category - The category of the questions.
     * @returns A question from the database of the specified category.
     */
    getQuestion: async function(category,lang="es") {
        if (await repository.existsQuestions(category, lang)){
            return await repository.getQuestions(category, 1, lang);
        }
        else
        {
            const questions = await service.fetchQuestionsFromWikidata(category, lang);
            await repository.insertQuestions(questions);
            return await repository.getQuestions(category, 1, lang);
        }
    },

    /**
     * Get n questions from the database.
     * If any question of the category exists in the database, generate new questions from wikidata, insert them into the database and return n questions.
     * @param {String} category - The category of the questions.
     * @param {int} n - Number of questions to retrieve
     * @param {String} lang - Language of the questions.
     * @returns An array of n questions from the database of the specified category.
     */
    getQuestions: async function(category, n, lang='es') {
        if (await repository.existsQuestions(category, lang)){
            return await repository.getQuestions(category, n, lang);
        }
        else
        {
            const questions = await service.fetchQuestionsFromWikidata(category, lang);
            await repository.insertQuestions(questions);
            return await repository.getQuestions(category, n, lang);
        }
    },

    /**
     * Check if the userOption is the correct answer.
     * When a quesion is resolv, it is deleted from the database.
     * @param {String} userOption 
     * @param {String} answer 
     * @returns true if the userOption is the correct answer, false otherwise.
     */
    checkCorrectAnswer: async function(userOption, answer){
        return userOption === answer;
    },

    /**
     * Delete all questions from the database.
     */
    clearAllQuestions: async function(){
        await repository.deleteQuestions();
    },

    /**
     * Delete questions from the database.
     * @param {question} questions 
     */
    deleteQuestions: async function(questions){
        for (let question of questions){
            await repository.deleteQuestion(question._id);
        }
        console.log("Questions deleted successfully");
    }

};

module.exports = service;