const fetch = require('node-fetch');

const WIKIDATA_SPARQL_URL = "https://query.wikidata.org/sparql";

async function fetchQuestionsFromWikidata() {
    const queries = [
        {
            category: "Arte",
            sparql: `SELECT ?itemLabel ?image WHERE {
                ?item wdt:P31 wd:Q3305213;  # Pintura
                      wdt:P18 ?image.
                SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
            } LIMIT 5`
        },
        {
            category: "Lugares",
            sparql: `SELECT ?itemLabel ?image WHERE {
                ?item wdt:P31 wd:Q515;  # Ciudad
                      wdt:P18 ?image.
                SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
            } LIMIT 5`
        }
    ];

    let questions = [];
    for (const query of queries) {
        const url = `${WIKIDATA_SPARQL_URL}?query=${encodeURIComponent(query.sparql)}&format=json`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            const newQuestions = data.results.bindings.map(entry => ({
                statements: [`¿Qué sabes sobre "${entry.itemLabel.value}"?`],
                answer: "Desconocido",  // Se puede mejorar
                image: entry.image.value,
                category: query.category
            }));
            questions = questions.concat(newQuestions);
        } catch (error) {
            console.error(`Error obteniendo datos de la categoría ${query.category}:`, error);
        }
    }
    return questions;
}

module.exports = { fetchQuestionsFromWikidata };
