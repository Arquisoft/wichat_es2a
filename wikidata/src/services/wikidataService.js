const getQueries = require('../model/wikidataQueries');
const fakeAnswers = require('../services/wikidataFakeAnswersService');
const repository = require('../repositories/wikidataRepository');
const fetch = require("node-fetch");

const WIKIDATA_SPARQL_URL = "https://query.wikidata.org/sparql";

// In-memory cache for Wikidata queries
const cache = {
    data: {},
    set: function(key, value, ttl = 3600000) { // TTL default: 1 hour
        this.data[key] = {
            value,
            expiry: Date.now() + ttl
        };
    },
    get: function(key) {
        const item = this.data[key];
        if (!item) return null;
        if (Date.now() > item.expiry) {
            delete this.data[key];
            return null;
        }
        return item.value;
    },
    has: function(key) {
        return this.get(key) !== null;
    }
};

// Sleep utility for exponential backoff
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

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

        // Check cache first
        const cacheKey = `${category}_${n}`;
        if (cache.has(cacheKey)) {
            console.log(`Using cached data for category: ${category}`);
            return cache.get(cacheKey);
        }

        // If not in cache, fetch from Wikidata with retry logic
        const url = `${WIKIDATA_SPARQL_URL}?query=${encodeURIComponent(query.sparql)}&format=json`;
        
        // Exponential backoff retry logic
        const maxRetries = 5;
        let retries = 0;
        
        while (retries < maxRetries) {
            try {
                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'WichatApp/1.0 (https://github.com/Arquisoft/wichat_es2a; info@wichat.app)'
                    }
                });
                
                if (!response.ok) {
                    const status = response.status;
                    
                    if (status === 429) {
                        // Rate limited - check for Retry-After header
                        const retryAfter = parseInt(response.headers.get('Retry-After') || '10', 10);
                        const backoffTime = Math.min(Math.pow(2, retries) * 1000 + Math.random() * 1000, retryAfter * 1000 || 60000);
                        console.warn(`Rate limited by Wikidata API (429). Retrying in ${backoffTime}ms. Retry ${retries + 1}/${maxRetries}`);
                        await sleep(backoffTime);
                        retries++;
                        continue;
                    }
                    
                    throw new Error(`Error in Wikidata request: ${response.status}`);
                }

                const data = await response.json();
                const newQuestions = data.results.bindings.map(entry => {
                    const correctAnswer = entry.answerLabel ? entry.answerLabel : "Desconocido";
                    const options = fakeAnswers.getFakeAnswers(correctAnswer, query.category);
                    return {
                        statements: query.statement,
                        answer: entry.answerLabel ? entry.answerLabel.value : "Desconocido",
                        image: entry.image ? entry.image.value : "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Question_mark_basic.svg/1200px-Question_mark_basic.svg.png",
                        category: query.category,
                        options: options
                    };
                });
                
                questions = [...questions, ...newQuestions];
                
                // Store in cache for 30 minutes
                cache.set(cacheKey, questions, 30 * 60 * 1000);
                
                // Success - break out of retry loop
                break;

            } catch (error) {
                console.error(`Error getting data from the category ${query.category}:`, error);
                if (retries >= maxRetries - 1) {
                    console.error(`Max retries reached for ${category}. Falling back to hardcoded questions.`);
                    // Return some hardcoded questions as fallback
                    questions = getFallbackQuestions(category, n);
                    cache.set(cacheKey, questions, 10 * 60 * 1000); // Cache for 10 minutes
                    break;
                }
                
                // Exponential backoff with jitter
                const backoffTime = Math.pow(2, retries) * 1000 + Math.random() * 1000;
                console.warn(`Retrying Wikidata request in ${backoffTime}ms. Retry ${retries + 1}/${maxRetries}`);
                await sleep(backoffTime);
                retries++;
            }
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
            const questions = await service.fetchQuestionsFromWikidata(category, 15);
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
     */    getQuestions: async function(category, n){
        try {
            // First check the DB
            const dbQuestions = await repository.getQuestions(category, n);
            if (dbQuestions && dbQuestions.length >= n) {
                console.log(`Retrieved ${dbQuestions.length} questions from DB for category: ${category}`);
                return dbQuestions;
            }
            
            // If not enough in DB, fetch from Wikidata (with caching)
            const questions = await service.fetchQuestionsFromWikidata(category, n);
            
            // Only insert if we got any questions
            if (questions.length > 0) {
                await repository.insertQuestions(questions);
            } else {
                console.warn(`No questions fetched from Wikidata for category: ${category}`);
                // Return fallback questions if Wikidata failed
                return getFallbackQuestions(category, n);
            }
            
            return questions;
        } catch (error) {
            console.error(`Error in getQuestions for category ${category}:`, error);
            return getFallbackQuestions(category, n);
        }
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

/**
 * Provides hardcoded questions as a fallback when Wikidata API fails
 * @param {String} category - The category of questions
 * @param {Number} n - Number of questions to return
 * @returns {Array} - Array of fallback question objects
 */
function getFallbackQuestions(category, n = 5) {
    const fallbackQuestions = {
        "Futbolistas": [
            {
                statements: "¿Qué futbolista ganó el Balón de Oro en 2021?",
                answer: "Lionel Messi",
                image: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Lionel-Messi-Argentina-2022-FIFA-World-Cup_%28cropped%29.jpg",
                category: "Futbolistas",
                options: ["Lionel Messi", "Cristiano Ronaldo", "Robert Lewandowski", "Karim Benzema"]
            },
            {
                statements: "¿Qué futbolista español es conocido como 'El Niño'?",
                answer: "Fernando Torres",
                image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Fernando_Torres_2017.jpg/800px-Fernando_Torres_2017.jpg",
                category: "Futbolistas",
                options: ["Fernando Torres", "David Villa", "Andrés Iniesta", "Sergio Ramos"]
            },
            {
                statements: "¿Qué futbolista brasileño es conocido como 'O Rei' (El Rey)?",
                answer: "Pelé",
                image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Pele_con_Brasil_%28cropped%29.jpg/800px-Pele_con_Brasil_%28cropped%29.jpg",
                category: "Futbolistas",
                options: ["Pelé", "Ronaldo", "Ronaldinho", "Neymar"]
            },
            {
                statements: "¿Qué futbolista portugués es conocido como 'CR7'?",
                answer: "Cristiano Ronaldo",
                image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cristiano_Ronaldo_2018.jpg/800px-Cristiano_Ronaldo_2018.jpg",
                category: "Futbolistas",
                options: ["Cristiano Ronaldo", "Luís Figo", "João Félix", "Bruno Fernandes"]
            },
            {
                statements: "¿Qué arquero español jugó en el Real Madrid y el Porto?",
                answer: "Iker Casillas",
                image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Iker_Casillas_2.jpg/800px-Iker_Casillas_2.jpg",
                category: "Futbolistas",
                options: ["Iker Casillas", "David de Gea", "Kepa Arrizabalaga", "Pepe Reina"]
            }
        ],
        "Pintores": [
            {
                statements: "¿Qué pintor español pintó el Guernica?",
                answer: "Pablo Picasso",
                image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Pablo_picasso_1.jpg/800px-Pablo_picasso_1.jpg",
                category: "Pintores",
                options: ["Pablo Picasso", "Salvador Dalí", "Francisco de Goya", "Diego Velázquez"]
            },
            {
                statements: "¿Qué pintor holandés se cortó parte de una oreja?",
                answer: "Vincent van Gogh",
                image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/VanGogh_1887_Selfportrait.jpg/800px-VanGogh_1887_Selfportrait.jpg",
                category: "Pintores",
                options: ["Vincent van Gogh", "Rembrandt", "Johannes Vermeer", "Piet Mondrian"]
            },
            {
                statements: "¿Quién pintó La Mona Lisa?",
                answer: "Leonardo da Vinci",
                image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Leonardo_self.jpg/800px-Leonardo_self.jpg",
                category: "Pintores",
                options: ["Leonardo da Vinci", "Miguel Ángel", "Rafael", "Tiziano"]
            },
            {
                statements: "¿Qué pintor noruego creó 'El grito'?",
                answer: "Edvard Munch",
                image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Edvard_Munch_-_Night_in_Saint-Cloud_-_Google_Art_Project.jpg/800px-Edvard_Munch_-_Night_in_Saint-Cloud_-_Google_Art_Project.jpg",
                category: "Pintores",
                options: ["Edvard Munch", "Gustav Klimt", "Claude Monet", "Pablo Picasso"]
            },
            {
                statements: "¿Qué pintor surrealista español pintó 'La persistencia de la memoria'?",
                answer: "Salvador Dalí",
                image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Salvador_Dal%C3%AD_1939.jpg/800px-Salvador_Dal%C3%AD_1939.jpg",
                category: "Pintores",
                options: ["Salvador Dalí", "Pablo Picasso", "Joan Miró", "Francisco de Goya"]
            }
        ],
        "Lugares": [
            {
                statements: "¿En qué país se encuentra la Torre Eiffel?",
                answer: "Francia",
                image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Tour_Eiffel_Wikimedia_Commons.jpg/800px-Tour_Eiffel_Wikimedia_Commons.jpg",
                category: "Lugares",
                options: ["Francia", "Italia", "España", "Alemania"]
            },
            {
                statements: "¿En qué país se encuentra el Taj Mahal?",
                answer: "India",
                image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/800px-Taj_Mahal_%28Edited%29.jpeg",
                category: "Lugares",
                options: ["India", "Pakistán", "Nepal", "Bangladesh"]
            },
            {
                statements: "¿En qué país se encuentra la Gran Muralla?",
                answer: "China",
                image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/The_Great_Wall_of_China_at_Jinshanling-edit.jpg/800px-The_Great_Wall_of_China_at_Jinshanling-edit.jpg",
                category: "Lugares",
                options: ["China", "Japón", "Mongolia", "Corea del Sur"]
            },
            {
                statements: "¿En qué país se encuentra Machu Picchu?",
                answer: "Perú",
                image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Machu_Picchu%2C_Peru.jpg/800px-Machu_Picchu%2C_Peru.jpg",
                category: "Lugares",
                options: ["Perú", "Bolivia", "Ecuador", "Colombia"]
            },
            {
                statements: "¿En qué país se encuentra el Coliseo?",
                answer: "Italia",
                image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/800px-Colosseo_2020.jpg",
                category: "Lugares",
                options: ["Italia", "Grecia", "España", "Francia"]
            }
        ]
    };
    
    // If we have fallback questions for this category, return them
    const questions = fallbackQuestions[category] || [];
    
    // Limit to the number requested
    return questions.slice(0, n);
}

module.exports = service;