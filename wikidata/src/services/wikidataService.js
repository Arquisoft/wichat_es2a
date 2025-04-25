const getQueries = require('../model/wikidataQueries');
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
     * @returns {Array} - An array of questions.
     */
    fetchQuestionsFromWikidata: async function(category, n) {
        let questions = [];
        const query = getQueries(n).find(q => q.category === category);
        if (!query) {
            console.error(`Category ${category} not found in the queries`);
            return questions;
        }
        const url = `${WIKIDATA_SPARQL_URL}?query=${encodeURIComponent(query.sparql)}&format=json`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error in Wikidata request: ${response.status}`);
            }

            const data = await response.json();
            const newQuestions = data.results.bindings.map(entry => {
                const correctAnswer = entry.answerLabel ? entry.answerLabel : "Desconocido";
                const options = fakeAnswers.getFakeAnswers(correctAnswer, query.category);
                return {
                    statements: query.statement,
                    answer: entry.answerLabel ? entry.answerLabel.value : "Desconocido",
                    image: entry.image.value,
                    category: query.category,
                    options: options
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
    getQuestion: async function(category) {
        if (await repository.existsQuestions(category)){
            return await repository.getQuestions(category, 1);
        }
        else
        {
            const questions = await service.fetchQuestionsFromWikidata(category, 10);
            await repository.insertQuestions(questions);
            return await repository.getQuestions(category, 1);
        }
    },

    /**
     * Get n questions from the database.
     * If any question of the category exists in the database, generate new questions from wikidata, insert them into the database and return n questions.
     * @param {String} category - The category of the questions.
     * @param {int} n - Number of questions to retrieve
     * @returns An array of n questions from the database of the specified category.
     */
    getQuestions: async function(category, n){
        const questions = await service.fetchQuestionsFromWikidata(category, n);
        await repository.insertQuestions(questions);
        return questions;
    },

    /**
     * Get all questions from the database.
     * @returns All questions from the database.
     */
    getAllQuestions: async function(){
        const questions = await repository.getAllQuestions();
        return questions;
    },

    /**
     * Get all questions from the database of a specific category.
     * @param {String} category - The category of the questions.
     * @returns All questions from the database of the specified category.
     */
    getAllQuestionsFromCategory: async function(category){
        const questions = await repository.getAllQuestionsFromCategory(category);
        return questions;
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