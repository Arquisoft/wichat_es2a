/*
    Queries para obtener preguntas de Wikidata (Queries to get questions from Wikidata)
    Cada objeto contiene la categoría y la consulta SPARQL (Each object contains the category and the SPARQL query.)
    1. Lugares (Places)
    2. Arte (Art)
    3. Actores (Actors)
    4. Cantantes (Singers)
    5. Pintores (Painters)
    6. Futbolistas (Soccer players)
    7. Banderas (Country flags)
    8. Filósofos (Philosophers)
    */
module.exports = [
        {
            category: "Lugares",
            sparql: `SELECT DISTINCT ?itemLabel ?image ?answerLabel WHERE {
                    {
                        SELECT ?item ?itemLabel ?image ?answerLabel WHERE {
                        ?item wdt:P31 wd:Q515;    # Ciudad
                                wdt:P18 ?image;     # Imagen
                                wdt:P17 ?answer.    # País de la ciudad (respuesta correcta)
                        SERVICE wikibase:label { bd:serviceParam wikibase:language "es". 
                                                ?answer rdfs:label ?answerLabel. }
                        } LIMIT 200
                    }
                    }
                    ORDER BY RAND()
                    LIMIT 10
                    `,
            statement: "¿A qué lugar corresponde la siguiente foto?"
        },
        {
            category: "Arte",
            sparql: `SELECT DISTINCT ?itemLabel ?image ?answerLabel WHERE {
                {
                    SELECT ?item ?itemLabel ?image WHERE {
                    ?item wdt:P31 wd:Q3305213;  # Es una pintura
                            wdt:P18 ?image.       # Tiene imagen
                    SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
                    } LIMIT 200
                }
                BIND(?itemLabel AS ?answerLabel)
                }
                ORDER BY RAND()
                LIMIT 10
                `,
            statement: "¿Cuál es el nombre de la obra?"
        },          
        {
            category: "Actores",
            sparql: `SELECT DISTINCT ?itemLabel ?image (?itemLabel AS ?answerLabel) WHERE {
                    {
                        SELECT ?item ?itemLabel ?image WHERE {
                        ?item wdt:P31 wd:Q5;             # Es humano
                                wdt:P106 wd:Q33999;        # Actor
                                wdt:P18 ?image.            # Tiene imagen
                        SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
                        } LIMIT 200
                    }
                    }
                    ORDER BY RAND()
                    LIMIT 10
            `,
            statement: "¿Quién es este actor?"
        },
        {
            category: "Cantantes",
            sparql: `SELECT DISTINCT ?itemLabel ?image (?itemLabel AS ?answerLabel) WHERE {
                {
                    SELECT ?item ?itemLabel ?image WHERE {
                    ?item wdt:P31 wd:Q5;           # Humano
                            wdt:P106 wd:Q177220;     # Ocupación: Cantante
                            wdt:P18 ?image.          # Imagen
                    SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
                    } LIMIT 200
                }
                }
                ORDER BY RAND()
                LIMIT 10
                `,
            statement: "¿Quién es este cantante?"
        },
        {
            category: "Pintores",
            sparql: `SELECT DISTINCT ?itemLabel ?image ?answerLabel WHERE {
                    {
                        SELECT ?item ?itemLabel ?image ?answerLabel WHERE {
                        ?item wdt:P31 wd:Q3305213;   # Es una pintura
                                wdt:P18 ?image;        # Tiene imagen
                                wdt:P170 ?answer.      # Autor (respuesta correcta)
                        SERVICE wikibase:label { 
                            bd:serviceParam wikibase:language "es". 
                            ?answer rdfs:label ?answerLabel.
                        }
                        } LIMIT 200
                    }
                    }
                    ORDER BY RAND()
                    LIMIT 10
                    `,
            statement: "¿Quién es el autor de esta obra?"
        },
        {
            category: "Futbolistas",
            sparql: `SELECT DISTINCT ?itemLabel ?image (?itemLabel AS ?answerLabel) WHERE {
                    {
                        SELECT ?item ?itemLabel ?image WHERE {
                            ?item wdt:P31 wd:Q5;                    # Humano
                                wdt:P106 wd:Q937857;              # Futbolista
                                wdt:P18 ?image.                   # Imagen

                            # Participación en algún equipo con fecha de inicio posterior a 1980
                            ?item p:P54 ?teamStatement.             # P54 = miembro de equipo
                            ?teamStatement pq:P580 ?startDate.      # Fecha de inicio (P580)
                            FILTER(YEAR(?startDate) > 1980)

                            SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
                        } LIMIT 200
                    }        
                    }
                    ORDER BY RAND()
                    LIMIT 10
                    `,
            statement: "¿Quién es este futbolista?"
        },
        {
            category: "Banderas",
            sparql: `SELECT DISTINCT ?itemLabel ?image (?itemLabel AS ?answerLabel) WHERE {
                {
                    SELECT ?item ?itemLabel ?image WHERE {
                    ?item wdt:P31 wd:Q6256;      # País
                            wdt:P41 ?image.        # Bandera
                    SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
                    } LIMIT 200
                }
                }
                ORDER BY RAND()
                LIMIT 10
                `,
            statement: "¿De qué país es esta bandera?"
        },
        {
            category: "Filosofos",
            sparql: `SELECT DISTINCT ?itemLabel ?image (?itemLabel AS ?answerLabel) WHERE {
                    {
                        SELECT ?item ?itemLabel ?image WHERE {
                        ?item wdt:P31 wd:Q5;             # Humano
                                wdt:P106 wd:Q4964182;      # Filósofo
                                wdt:P18 ?image.            # Imagen
                        SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
                        } LIMIT 200
                    }
                    }
                    ORDER BY RAND()
                    LIMIT 10
                    `,
            statement: "¿Quién es este filósofo?"
        },
        {
            category: "DeportistasEspañoles",
            sparql: `SELECT DISTINCT ?itemLabel ?image (?itemLabel AS ?answerLabel) WHERE {
                {
                    SELECT ?item ?itemLabel ?image WHERE {
                    ?item wdt:P31 wd:Q5;                      # Es humano
                            wdt:P106 wd:Q2066131;              # Deportista
                            wdt:P27 wd:Q29;                    # Nacionalidad española
                            wdt:P18 ?image.                    # Tiene imagen
                            ?item wikibase:sitelinks ?sitelinks.  # Cuántas Wikipedias lo enlazan
                    SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
                    } LIMIT 200
                }
                }
                ORDER BY DESC(?sitelinks)               # Ordenar por fama
                LIMIT 10
                `,
            statement: "¿Quién es este deportista español?"
        },
        {
            category: "Científicos",
            sparql: `SELECT DISTINCT ?itemLabel ?image (?itemLabel AS ?answerLabel) WHERE {
                {
                    SELECT ?item ?itemLabel ?image WHERE {
                        ?item wdt:P31 wd:Q5;                     # Es humano
                                wdt:P106 ?occupation;             # Tiene ocupación
                                wdt:P18 ?image.                   # Tiene imagen
                        ?occupation wdt:P279* wd:Q901.          # Subclase de científico
                        SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
                    } LIMIT 200
                }
            }
            ORDER BY RAND()
            LIMIT 10
            `,
            statement: "¿Quién es este científico?"
        }
    ];