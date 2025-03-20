const fetch = require("node-fetch");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

const WIKIDATA_SPARQL_URL = "https://query.wikidata.org/sparql";

// Función para generar opciones falsas (por ejemplo, nombres de países aleatorios)
const generateFakeAnswers = (correctAnswer) => {
    const fakeAnswers = [
        "Francia", "Italia", "Alemania", "España", "Brasil", "Argentina"
    ];
    const randomAnswers = fakeAnswers.filter(answer => answer !== correctAnswer);
    // Tomamos 3 respuestas falsas aleatorias
    const options = [correctAnswer, ...randomAnswers.sort(() => 0.5 - Math.random()).slice(0, 3)];
    return options.sort(() => 0.5 - Math.random()); // Mezclamos las respuestas
};


async function fetchQuestionsFromWikidata() {
    const queries = [
        {
            category: "Lugares",
            sparql: `SELECT ?itemLabel ?image ?answerLabel WHERE {
                ?item wdt:P31 wd:Q515;  # Ciudad
                      wdt:P18 ?image;   # Imagen
                      wdt:P17 ?answer.  # País de la ciudad (respuesta correcta)
                SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
            } LIMIT 20`
        },
        /*
        {
            category: "Arte",
            sparql: `SELECT ?itemLabel ?image ?answerLabel WHERE {
                    ?item wdt:P31 wd:Q3305213;  # Es una pintura
                            wdt:P18 ?image;        # Tiene imagen
                            wdt:P170 ?answer.      # Su autor (respuesta correcta)
                    SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
                    } LIMIT 3`
        },
        {
            category: "Personajes",
            sparql: `SELECT ?itemLabel ?image ?answerLabel WHERE {
                ?item wdt:P31 wd:Q5;  # Persona
                      wdt:P18 ?image;  # Imagen
                      wdt:P27 ?answer. # País de nacimiento (respuesta correcta)
                SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
            } LIMIT 5`
        },
        {
            category: "Ciencia",
            sparql: `SELECT ?itemLabel ?image ?answerLabel WHERE {
                ?item wdt:P31 wd:Q5;  # Persona
                      wdt:P18 ?image;  # Imagen
                      wdt:P106 ?answer. # Ocupación (respuesta correcta)
                SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
            } LIMIT 5`
        },
        {
            category: "Cultura",
            sparql: `SELECT ?itemLabel ?image ?answerLabel WHERE {
                ?item wdt:P31 wd:Q5;  # Persona
                      wdt:P18 ?image;  # Imagen
                      wdt:P106 ?answer. # Ocupación (respuesta correcta)
                SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
            } LIMIT 5`
        },
        */
    ];

    let questions = [];
    for (const query of queries) {
        const url = `${WIKIDATA_SPARQL_URL}?query=${encodeURIComponent(query.sparql)}&format=json`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error in Wikidata request: ${response.status}`);
            }

            const data = await response.json();

            /*
            const newQuestions = data.results.bindings.map(entry => ({
                statements: [`¿Qué sabes sobre "${entry.itemLabel.value}"?`],
                answer: `"${entry.answerLabel.value}"`, 
                image: entry.image.value,
                category: query.category
            }));
            */

            const newQuestions = data.results.bindings.map(entry => {
                const correctAnswer = entry.answerLabel ? entry.answerLabel.value : "Desconocido";
                const options = generateFakeAnswers(correctAnswer);

                return{
                statements: ["¿A qué lugar corresponde la siguiente foto?"],
                answer: entry.answerLabel ? entry.answerLabel.value : "Desconocido",
                image: entry.image.value,
                category: query.category,
                options: options
                };
            });

            questions = questions.concat(newQuestions);

        } catch (error) {
            console.error(`Error getting data from the category ${query.category}:`, error);
        }
    }
    return questions;
}

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

module.exports = { fetchQuestionsFromWikidata };
