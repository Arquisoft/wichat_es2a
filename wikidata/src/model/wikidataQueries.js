/*
    Queries para obtener preguntas de Wikidata (Queries to get questions from Wikidata)
    Cada objeto contiene la categoría y la consulta SPARQL (Each object contains the category and the SPARQL query.)
    1. Lugares (Places)
    2. Arte (Art)
    3. Actores (Actors)
    4. Cantantes (Singers)
    5. Pintores (Painters)
    */
module.exports = [
        {
            category: "Lugares",
            sparql: `SELECT DISTINCT ?itemLabel ?image ?answerLabel WHERE {
                ?item wdt:P31 wd:Q515;  # Ciudad
                      wdt:P18 ?image;   # Imagen
                      wdt:P17 ?answer.  # País de la ciudad (respuesta correcta)
                SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
            } LIMIT 10`,
            statement: "¿A qué lugar corresponde la siguiente foto?"
        },
        {
            category: "Arte",
            sparql: `SELECT DISTINCT ?itemLabel ?image ?answerLabel WHERE {
                ?item wdt:P31 wd:Q3305213;  # Es una pintura
                      wdt:P18 ?image.      # Tiene imagen
                SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
                BIND(?itemLabel AS ?answerLabel)
            } LIMIT 10`,
            statement: "¿Cuál es el nombre de la obra?"
        },          
        {
            category: "Actores",
            sparql: `SELECT DISTINCT ?itemLabel ?image ( ?itemLabel AS ?answerLabel ) WHERE {
                ?item wdt:P31 wd:Q5;
                      wdt:P106 wd:Q33999;  # Ocupación: Actor
                      wdt:P18 ?image.      # Imagen
                SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
            } LIMIT 10`,
            statement: "¿Quién es este actor?"
        },
        {
            category: "Cantantes",
            sparql: `SELECT DISTINCT ?itemLabel ?image ( ?itemLabel AS ?answerLabel ) WHERE {
                ?item wdt:P31 wd:Q5;     # Humano
                      wdt:P106 wd:Q177220; # Ocupación: Cantante
                      wdt:P18 ?image.      # Imagen
                SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
            } LIMIT 10`,
            statement: "¿Quién es este cantante?"
        },
        {
            category: "Pintores",
            sparql: `SELECT DISTINCT ?itemLabel ?image ?answerLabel WHERE {
                    ?item wdt:P31 wd:Q3305213;  # Es una pintura
                            wdt:P18 ?image;        # Tiene imagen
                            wdt:P170 ?answer.      # Su autor (respuesta correcta)
                    SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
                    } LIMIT 10`,
            statement: "¿Quién es el autor de esta obra?"
        }          
    ];