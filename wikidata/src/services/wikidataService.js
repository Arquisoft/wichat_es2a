const queries = require('../model/wikidataQueries');
const fakeAnswers = require('../services/wikidataFakeAnswersService');
const repository = require('../repositories/wikidataRepository');
const fetch = require("node-fetch");

const WIKIDATA_SPARQL_URL = "https://query.wikidata.org/sparql";

const service = {
    /**
     * Generate questions from Wikidata.
     * Use the SPARQL query to get the data from Wikidata.
     * Generate the question id using the current timestamp.
     * Generate the fake answers using the `getFakeAnswers` function.
     * @param {String} category - The category of the questions.
     * @returns {Array} - An array of questions.
     */
    fetchQuestionsFromWikidata: async function(category) {
        let questions = [];
        const query = queries.find(q => q.category === category);
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
                const correctAnswer = entry.answerLabel ? entry.answerLabel.value : "Desconocido";
                const options = fakeAnswers.getFakeAnswers(correctAnswer, query.category);
                return {
                    statements: query.statement,
                    answer: entry.answerLabel ? entry.answerLabel.value : "Desconocido",
                    image: entry.image.value,
                    category: query.category,
                    options: options,
                    id: Date.now().toString(36) 
                };
            });
            
            questions = questions.concat(newQuestions);

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
        if(repository.exitsQuestions(category)){
            return await repository.getQuestions(category, 1);
        }
        else
        {
            const questions = service.fetchQuestionsFromWikidata(category);
            await repository.insertQuestions(questions);
            return await repository.getQuestions(category, 1);
        }
    },

    /**
     * Check if the userOption is the correct answer.
     * When a quesion is resolv, it is deleted from the database.
     * @param {String} id 
     * @param {String} userOption 
     * @param {String} answer 
     * @returns true if the userOption is the correct answer, false otherwise.
     */
    checkCorrectAnswer: async function(id, userOption, answer){
        repository.deleteQuestion(id);
        return userOption === answer;
    }

};

module.exports = service;

/*
// Configuración de la ruta para servir las preguntas a tu frontend
app.get("/wikidata/question", async (req, res) => {
    try {
        const questions = await fetchQuestionsFromWikidata();
        const formattedQuestions = questions.map(q=>({
            statements: [q.statements[0] || "Pregunta sin texto"],
            image: q.image || "default",
            options: q.options || [],
            correctAnswer: q.answer || "Respuesta desconocida"
        }));
        
        res.json(questions);
    } catch (error) {
        console.error("Error al obtener las preguntas:", error);
        res.status(500).json({ error: "Error al obtener las preguntas de Wikidata" });
    }
});

// Iniciar el servidor en el puerto 3001
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
*/