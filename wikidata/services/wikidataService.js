const fetch = require("node-fetch");

const WIKIDATA_SPARQL_URL = "https://query.wikidata.org/sparql";

async function fetchQuestionsFromWikidata() {
    const queries = [
        {
            category: "Lugares",
            sparql: `SELECT ?itemLabel ?image ?answerLabel WHERE {
                ?item wdt:P31 wd:Q515;  # Ciudad
                      wdt:P18 ?image;   # Imagen
                      wdt:P17 ?answer.  # País de la ciudad (respuesta correcta)
                SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
            } LIMIT 5`
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

            const newQuestions = data.results.bindings.map(entry => ({
                statements: ["¿A qué lugar corresponde la siguiente foto?"],
                answer: entry.answerLabel ? entry.answerLabel.value : "Desconocido",
                image: entry.image.value,
                category: query.category
            }));

            questions = questions.concat(newQuestions);

        } catch (error) {
            console.error(`Error getting data from the category ${query.category}:`, error);
        }
    }
    return questions;
}

module.exports = { fetchQuestionsFromWikidata };
