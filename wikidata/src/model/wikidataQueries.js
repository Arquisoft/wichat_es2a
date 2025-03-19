/*
    Queries para obtener preguntas de Wikidata (Queries to get questions from Wikidata)
    Cada objeto contiene la categoría y la consulta SPARQL (Each object contains the category and the SPARQL query.)
    1. Lugares (Places)
    2. Arte (Art)
    3. Actores (Actors)
    4. Cantantes (Singers)
    5. Películas (Movies)
    */
const queries = [
        {
            category: "Lugares",
            sparql: `SELECT ?itemLabel ?image ?answerLabel WHERE {
                ?item wdt:P31 wd:Q515;  # Ciudad
                      wdt:P18 ?image;   # Imagen
                      wdt:P17 ?answer.  # País de la ciudad (respuesta correcta)
                SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
            } LIMIT 20`,
            statement: "¿A qué lugar corresponde la siguiente foto?"
        },
        {
            category: "Arte",
            sparql: `SELECT ?itemLabel ?image ?answerLabel WHERE {
                    ?item wdt:P31 wd:Q3305213;  # Es una pintura
                            wdt:P18 ?image;        # Tiene imagen
                            wdt:P170 ?answer.      # Su autor (respuesta correcta)
                    SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
                    } LIMIT 3`,
            statement: "¿Quién es el autor de esta obra?"
        },
        {
            category: "Actores",
            sparql: `SELECT ?itemLabel ?image WHERE {
                ?item wdt:P31 wd:Q5;       # Actor
                    wdt:P18 ?image.      # Imagen
                SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
            } LIMIT 5`,
            statement: "¿Quién es este actor?"

        },
        {
        category: "Cantantes",
        sparql: `SELECT ?itemLabel ?image WHERE {
            ?item wdt:P31 wd:Q5;     # Humano
                wdt:P106 wd:Q177220; # Ocupación: Cantante
                wdt:P18 ?image.      # Imagen
            SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
        } LIMIT 5`,
        statement: "¿Quién es este cantante?"
        },
        {
            category: "Películas",
            sparql: `SELECT ?itemLabel ?image WHERE {
                ?item wdt:P31 wd:Q11424; # Instancia de: Película
                      wdt:P18 ?image.    # Imagen
                SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
            } LIMIT 5`,
            statement: "¿Qué película es esta?"
        }            
    ];