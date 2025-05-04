 // src/utils/queries.js
 
 // /**
 //  * Devuelve el array de queries con el LIMIT exterior personalizado.
 //  * @param {number} outerLimit — número de resultados finales por query
 //  */
 function getQueries(outerLimit) {
     return [
       {
         category: "Lugares",
         statement: "¿A qué lugar corresponde la siguiente foto?",
         sparql: `
           SELECT DISTINCT ?itemLabel ?image ?answerLabel WHERE {
             {
               SELECT ?item ?itemLabel ?image ?answerLabel WHERE {
                 ?item wdt:P31 wd:Q515;    # Ciudad
                       wdt:P18 ?image;     # Imagen
                       wdt:P17 ?answer.    # País de la ciudad
                 SERVICE wikibase:label {
                   bd:serviceParam wikibase:language "es".
                   ?answer rdfs:label ?answerLabel.
                 }
               } LIMIT 200
             }
           }
           ORDER BY RAND()
           LIMIT ${outerLimit}
         `
       },
       {
         category: "Arte",
         statement: "¿Cuál es el nombre de la obra?",
         sparql: `
           SELECT DISTINCT ?itemLabel ?image ?answerLabel WHERE {
             {
               SELECT ?item ?itemLabel ?image WHERE {
                 ?item wdt:P31 wd:Q3305213;  # Pintura
                       wdt:P18 ?image.       # Imagen
                 SERVICE wikibase:label {
                   bd:serviceParam wikibase:language "es".
                 }
               } LIMIT 200
             }
             BIND(?itemLabel AS ?answerLabel)
           }
           ORDER BY RAND()
           LIMIT ${outerLimit}
         `
       },
       {
         category: "Actores",
         statement: "¿Quién es este actor?",
         sparql: `
           SELECT DISTINCT ?itemLabel ?image (?itemLabel AS ?answerLabel) WHERE {
             {
               SELECT ?item ?itemLabel ?image WHERE {
                 ?item wdt:P31 wd:Q5;          # Humano
                       wdt:P106 wd:Q33999;    # Actor
                       wdt:P18 ?image.        # Imagen
                 SERVICE wikibase:label {
                   bd:serviceParam wikibase:language "es".
                 }
               } LIMIT 200
             }
           }
           ORDER BY RAND()
           LIMIT ${outerLimit}
         `
       },
       {
         category: "Cantantes",
         statement: "¿Quién es este cantante?",
         sparql: `
           SELECT DISTINCT ?itemLabel ?image (?itemLabel AS ?answerLabel) WHERE {
             {
               SELECT ?item ?itemLabel ?image WHERE {
                 ?item wdt:P31 wd:Q5;          # Humano
                       wdt:P106 wd:Q177220;   # Cantante
                       wdt:P18 ?image.        # Imagen
                 SERVICE wikibase:label {
                   bd:serviceParam wikibase:language "es".
                 }
               } LIMIT 200
             }
           }
           ORDER BY RAND()
           LIMIT ${outerLimit}
         `
       },
       {
         category: "Pintores",
         statement: "¿Quién es el autor de esta obra?",
         sparql: `
           SELECT DISTINCT ?itemLabel ?image ?answerLabel WHERE {
             {
               SELECT ?item ?itemLabel ?image ?answerLabel WHERE {
                 ?item wdt:P31 wd:Q3305213;   # Pintura
                       wdt:P18 ?image;        # Imagen
                       wdt:P170 ?answer.      # Autor
                 SERVICE wikibase:label {
                   bd:serviceParam wikibase:language "es".
                   ?answer rdfs:label ?answerLabel.
                 }
               } LIMIT 200
             }
           }
           ORDER BY RAND()
           LIMIT ${outerLimit}
         `
       },
       {
         category: "Futbolistas",
         statement: "¿Quién es este futbolista?",
         sparql: `
          SELECT DISTINCT ?itemLabel ?image (?itemLabel AS ?answerLabel) WHERE {
            {
              SELECT ?item ?itemLabel ?image WHERE {
                ?item wdt:P31 wd:Q5;
                  wdt:P106 wd:Q937857;
                  wdt:P18 ?image.
              OPTIONAL {
                ?item p:P54 ?teamStatement.
                ?teamStatement pq:P580 ?startDate.
              FILTER(YEAR(?startDate) > 1980)
              }
              SERVICE wikibase:label {
                bd:serviceParam wikibase:language "es".
              }
            } LIMIT 200
          }
        }
        ORDER BY RAND()
        LIMIT ${outerLimit}
         `
       },
       {
         category: "Banderas",
         statement: "¿De qué país es esta bandera?",
         sparql: `
           SELECT DISTINCT ?itemLabel ?image (?itemLabel AS ?answerLabel) WHERE {
             {
               SELECT ?item ?itemLabel ?image WHERE {
                 ?item wdt:P31 wd:Q6256;      # País
                       wdt:P41 ?image.        # Bandera
                 SERVICE wikibase:label {
                   bd:serviceParam wikibase:language "es".
                 }
               } LIMIT 200
             }
           }
           ORDER BY RAND()
           LIMIT ${outerLimit}
         `
       },
       {
         category: "Filosofos",
         statement: "¿Quién es este filósofo?",
         sparql: `
           SELECT DISTINCT ?itemLabel ?image (?itemLabel AS ?answerLabel) WHERE {
             {
               SELECT ?item ?itemLabel ?image WHERE {
                 ?item wdt:P31 wd:Q5;             # Humano
                       wdt:P106 wd:Q4964182;      # Filósofo
                       wdt:P18 ?image.            # Imagen
                 SERVICE wikibase:label {
                   bd:serviceParam wikibase:language "es".
                 }
               } LIMIT 200
             }
           }
           ORDER BY RAND()
           LIMIT ${outerLimit}
         `
       },
       {
         category: "Científicos",
         statement: "¿Quién es este científico?",
         sparql: `
           SELECT DISTINCT ?itemLabel ?image (?itemLabel AS ?answerLabel) WHERE {
             {
               SELECT ?item ?itemLabel ?image WHERE {
                 ?item wdt:P31 wd:Q5;                # Humano
                       wdt:P106 ?occupation;         # Ocupación
                       wdt:P18 ?image.               # Imagen
                 ?occupation wdt:P279* wd:Q901.     # Subclase de científico
                 SERVICE wikibase:label {
                   bd:serviceParam wikibase:language "es".
                 }
               } LIMIT 200
             }
           }
           ORDER BY RAND()
           LIMIT ${outerLimit}
         `
       }
     ];
   }
   
   module.exports = getQueries;