// // src/utils/queries.js

// /**
//  * Devuelve el array de queries con el LIMIT exterior personalizado.
//  * @param {number} outerLimit — número de resultados finales por query
//  */
// function getQueries(outerLimit) {
//     return [
//       {
//         category: "Lugares",
//         statement: "¿A qué lugar corresponde la siguiente foto?",
//         sparql: `
//           SELECT DISTINCT ?itemLabel ?image ?answerLabel WHERE {
//             {
//               SELECT ?item ?itemLabel ?image ?answerLabel WHERE {
//                 ?item wdt:P31 wd:Q515;    # Ciudad
//                       wdt:P18 ?image;     # Imagen
//                       wdt:P17 ?answer.    # País de la ciudad
//                 SERVICE wikibase:label {
//                   bd:serviceParam wikibase:language "es".
//                   ?answer rdfs:label ?answerLabel.
//                 }
//               } LIMIT 200
//             }
//           }
//           ORDER BY RAND()
//           LIMIT ${outerLimit}
//         `
//       },
//       {
//         category: "Arte",
//         statement: "¿Cuál es el nombre de la obra?",
//         sparql: `
//           SELECT DISTINCT ?itemLabel ?image ?answerLabel WHERE {
//             {
//               SELECT ?item ?itemLabel ?image WHERE {
//                 ?item wdt:P31 wd:Q3305213;  # Pintura
//                       wdt:P18 ?image.       # Imagen
//                 SERVICE wikibase:label {
//                   bd:serviceParam wikibase:language "es".
//                 }
//               } LIMIT 200
//             }
//             BIND(?itemLabel AS ?answerLabel)
//           }
//           ORDER BY RAND()
//           LIMIT ${outerLimit}
//         `
//       },
//       {
//         category: "Actores",
//         statement: "¿Quién es este actor?",
//         sparql: `
//           SELECT DISTINCT ?itemLabel ?image (?itemLabel AS ?answerLabel) WHERE {
//             {
//               SELECT ?item ?itemLabel ?image WHERE {
//                 ?item wdt:P31 wd:Q5;          # Humano
//                       wdt:P106 wd:Q33999;    # Actor
//                       wdt:P18 ?image.        # Imagen
//                 SERVICE wikibase:label {
//                   bd:serviceParam wikibase:language "es".
//                 }
//               } LIMIT 200
//             }
//           }
//           ORDER BY RAND()
//           LIMIT ${outerLimit}
//         `
//       },
//       {
//         category: "Cantantes",
//         statement: "¿Quién es este cantante?",
//         sparql: `
//           SELECT DISTINCT ?itemLabel ?image (?itemLabel AS ?answerLabel) WHERE {
//             {
//               SELECT ?item ?itemLabel ?image WHERE {
//                 ?item wdt:P31 wd:Q5;          # Humano
//                       wdt:P106 wd:Q177220;   # Cantante
//                       wdt:P18 ?image.        # Imagen
//                 SERVICE wikibase:label {
//                   bd:serviceParam wikibase:language "es".
//                 }
//               } LIMIT 200
//             }
//           }
//           ORDER BY RAND()
//           LIMIT ${outerLimit}
//         `
//       },
//       {
//         category: "Pintores",
//         statement: "¿Quién es el autor de esta obra?",
//         sparql: `
//           SELECT DISTINCT ?itemLabel ?image ?answerLabel WHERE {
//             {
//               SELECT ?item ?itemLabel ?image ?answerLabel WHERE {
//                 ?item wdt:P31 wd:Q3305213;   # Pintura
//                       wdt:P18 ?image;        # Imagen
//                       wdt:P170 ?answer.      # Autor
//                 SERVICE wikibase:label {
//                   bd:serviceParam wikibase:language "es".
//                   ?answer rdfs:label ?answerLabel.
//                 }
//               } LIMIT 200
//             }
//           }
//           ORDER BY RAND()
//           LIMIT ${outerLimit}
//         `
//       },
//       {
//         category: "Futbolistas",
//         statement: "¿Quién es este futbolista?",
//         sparql: `
//           SELECT DISTINCT ?itemLabel ?image (?itemLabel AS ?answerLabel) WHERE {
//             {
//               SELECT ?item ?itemLabel ?image WHERE {
//                 ?item wdt:P31 wd:Q5;              # Humano
//                       wdt:P106 wd:Q937857;       # Futbolista
//                       wdt:P18 ?image.            # Imagen
//                 ?item p:P54 ?teamStatement;       # Miembro de equipo
//                 ?teamStatement pq:P580 ?startDate.
//                 FILTER(YEAR(?startDate) > 1980)
//                 SERVICE wikibase:label {
//                   bd:serviceParam wikibase:language "es".
//                 }
//               } LIMIT 200
//             }
//           }
//           ORDER BY RAND()
//           LIMIT ${outerLimit}
//         `
//       },
//       {
//         category: "Banderas",
//         statement: "¿De qué país es esta bandera?",
//         sparql: `
//           SELECT DISTINCT ?itemLabel ?image (?itemLabel AS ?answerLabel) WHERE {
//             {
//               SELECT ?item ?itemLabel ?image WHERE {
//                 ?item wdt:P31 wd:Q6256;      # País
//                       wdt:P41 ?image.        # Bandera
//                 SERVICE wikibase:label {
//                   bd:serviceParam wikibase:language "es".
//                 }
//               } LIMIT 200
//             }
//           }
//           ORDER BY RAND()
//           LIMIT ${outerLimit}
//         `
//       },
//       {
//         category: "Filosofos",
//         statement: "¿Quién es este filósofo?",
//         sparql: `
//           SELECT DISTINCT ?itemLabel ?image (?itemLabel AS ?answerLabel) WHERE {
//             {
//               SELECT ?item ?itemLabel ?image WHERE {
//                 ?item wdt:P31 wd:Q5;             # Humano
//                       wdt:P106 wd:Q4964182;      # Filósofo
//                       wdt:P18 ?image.            # Imagen
//                 SERVICE wikibase:label {
//                   bd:serviceParam wikibase:language "es".
//                 }
//               } LIMIT 200
//             }
//           }
//           ORDER BY RAND()
//           LIMIT ${outerLimit}
//         `
//       },
//       {
//         category: "DeportistasEspañoles",
//         statement: "¿Quién es este deportista español?",
//         sparql: `
//           SELECT DISTINCT ?itemLabel ?image (?itemLabel AS ?answerLabel) WHERE {
//             {
//               SELECT ?item ?itemLabel ?image WHERE {
//                 ?item wdt:P31 wd:Q5;              # Humano
//                       wdt:P106 wd:Q2066131;       # Deportista
//                       wdt:P27 wd:Q29;             # Español
//                       wdt:P18 ?image;             # Imagen
//                       ?item wikibase:sitelinks ?links.
//                 SERVICE wikibase:label {
//                   bd:serviceParam wikibase:language "es".
//                 }
//               } LIMIT 200
//             }
//           }
//           ORDER BY DESC(?links)
//           LIMIT ${outerLimit}
//         `
//       },
//       {
//         category: "Científicos",
//         statement: "¿Quién es este científico?",
//         sparql: `
//           SELECT DISTINCT ?itemLabel ?image (?itemLabel AS ?answerLabel) WHERE {
//             {
//               SELECT ?item ?itemLabel ?image WHERE {
//                 ?item wdt:P31 wd:Q5;                # Humano
//                       wdt:P106 ?occupation;         # Ocupación
//                       wdt:P18 ?image.               # Imagen
//                 ?occupation wdt:P279* wd:Q901.     # Subclase de científico
//                 SERVICE wikibase:label {
//                   bd:serviceParam wikibase:language "es".
//                 }
//               } LIMIT 200
//             }
//           }
//           ORDER BY RAND()
//           LIMIT ${outerLimit}
//         `
//       }
//     ];
//   }
  
//   module.exports = getQueries;
  



// // src/utils/queries.js

// // /**
// //  * Devuelve el array de queries con el LIMIT exterior personalizado.
// //  * @param {number} outerLimit — número de resultados finales por query
// //  */
// function getQueries(outerLimit) {
//     return [
//       {
//         category: "Lugares",
//         statement: "¿A qué lugar corresponde la siguiente foto?",
//         sparql: `
//           SELECT DISTINCT ?itemLabel ?image ?answerLabel WHERE {
//             {
//               SELECT ?item ?itemLabel ?image ?answerLabel WHERE {
//                 ?item wdt:P31 wd:Q515;    # Ciudad
//                       wdt:P18 ?image;     # Imagen
//                       wdt:P17 ?answer.    # País de la ciudad
//                 SERVICE wikibase:label {
//                   bd:serviceParam wikibase:language "es".
//                   ?answer rdfs:label ?answerLabel.
//                 }
//               } LIMIT 200
//             }
//           }
//           ORDER BY RAND()
//           LIMIT ${outerLimit}
//         `
//       },
//       {
//         category: "Arte",
//         statement: "¿Cuál es el nombre de la obra?",
//         sparql: `
//           SELECT DISTINCT ?itemLabel ?image ?answerLabel WHERE {
//             {
//               SELECT ?item ?itemLabel ?image WHERE {
//                 ?item wdt:P31 wd:Q3305213;  # Pintura
//                       wdt:P18 ?image.       # Imagen
//                 SERVICE wikibase:label {
//                   bd:serviceParam wikibase:language "es".
//                 }
//               } LIMIT 200
//             }
//             BIND(?itemLabel AS ?answerLabel)
//           }
//           ORDER BY RAND()
//           LIMIT ${outerLimit}
//         `
//       },
//       {
//         category: "Actores",
//         statement: "¿Quién es este actor?",
//         sparql: `
//           SELECT DISTINCT ?itemLabel ?image (?itemLabel AS ?answerLabel) WHERE {
//             {
//               SELECT ?item ?itemLabel ?image WHERE {
//                 ?item wdt:P31 wd:Q5;          # Humano
//                       wdt:P106 wd:Q33999;    # Actor
//                       wdt:P18 ?image.        # Imagen
//                 SERVICE wikibase:label {
//                   bd:serviceParam wikibase:language "es".
//                 }
//               } LIMIT 200
//             }
//           }
//           ORDER BY RAND()
//           LIMIT ${outerLimit}
//         `
//       },
//       {
//         category: "Cantantes",
//         statement: "¿Quién es este cantante?",
//         sparql: `
//           SELECT DISTINCT ?itemLabel ?image (?itemLabel AS ?answerLabel) WHERE {
//             {
//               SELECT ?item ?itemLabel ?image WHERE {
//                 ?item wdt:P31 wd:Q5;          # Humano
//                       wdt:P106 wd:Q177220;   # Cantante
//                       wdt:P18 ?image.        # Imagen
//                 SERVICE wikibase:label {
//                   bd:serviceParam wikibase:language "es".
//                 }
//               } LIMIT 200
//             }
//           }
//           ORDER BY RAND()
//           LIMIT ${outerLimit}
//         `
//       },
//       {
//         category: "Pintores",
//         statement: "¿Quién es el autor de esta obra?",
//         sparql: `
//           SELECT DISTINCT ?itemLabel ?image ?answerLabel WHERE {
//             {
//               SELECT ?item ?itemLabel ?image ?answerLabel WHERE {
//                 ?item wdt:P31 wd:Q3305213;   # Pintura
//                       wdt:P18 ?image;        # Imagen
//                       wdt:P170 ?answer.      # Autor
//                 SERVICE wikibase:label {
//                   bd:serviceParam wikibase:language "es".
//                   ?answer rdfs:label ?answerLabel.
//                 }
//               } LIMIT 200
//             }
//           }
//           ORDER BY RAND()
//           LIMIT ${outerLimit}
//         `
//       },
//       {
//         category: "Futbolistas",
//         statement: "¿Quién es este futbolista?",
//         sparql: `
//           SELECT DISTINCT ?itemLabel ?image (?itemLabel AS ?answerLabel) WHERE {
//             {
//               SELECT ?item ?itemLabel ?image WHERE {
//                 ?item wdt:P31 wd:Q5;              # Humano
//                       wdt:P106 wd:Q937857;       # Futbolista
//                       wdt:P18 ?image.            # Imagen
//                 ?item p:P54 ?teamStatement;       # Miembro de equipo
//                 ?teamStatement pq:P580 ?startDate.
//                 FILTER(YEAR(?startDate) > 1980)
//                 SERVICE wikibase:label {
//                   bd:serviceParam wikibase:language "es".
//                 }
//               } LIMIT 200
//             }
//           }
//           ORDER BY RAND()
//           LIMIT ${outerLimit}
//         `
//       },
//       {
//         category: "Banderas",
//         statement: "¿De qué país es esta bandera?",
//         sparql: `
//           SELECT DISTINCT ?itemLabel ?image (?itemLabel AS ?answerLabel) WHERE {
//             {
//               SELECT ?item ?itemLabel ?image WHERE {
//                 ?item wdt:P31 wd:Q6256;      # País
//                       wdt:P41 ?image.        # Bandera
//                 SERVICE wikibase:label {
//                   bd:serviceParam wikibase:language "es".
//                 }
//               } LIMIT 200
//             }
//           }
//           ORDER BY RAND()
//           LIMIT ${outerLimit}
//         `
//       },
//       {
//         category: "Filosofos",
//         statement: "¿Quién es este filósofo?",
//         sparql: `
//           SELECT DISTINCT ?itemLabel ?image (?itemLabel AS ?answerLabel) WHERE {
//             {
//               SELECT ?item ?itemLabel ?image WHERE {
//                 ?item wdt:P31 wd:Q5;             # Humano
//                       wdt:P106 wd:Q4964182;      # Filósofo
//                       wdt:P18 ?image.            # Imagen
//                 SERVICE wikibase:label {
//                   bd:serviceParam wikibase:language "es".
//                 }
//               } LIMIT 200
//             }
//           }
//           ORDER BY RAND()
//           LIMIT ${outerLimit}
//         `
//       },
//       {
//         category: "DeportistasEspañoles",
//         statement: "¿Quién es este deportista español?",
//         sparql: `
//           SELECT DISTINCT ?itemLabel ?image (?itemLabel AS ?answerLabel) WHERE {
//             {
//               SELECT ?item ?itemLabel ?image WHERE {
//                 ?item wdt:P31 wd:Q5;              # Humano
//                       wdt:P106 wd:Q2066131;       # Deportista
//                       wdt:P27 wd:Q29;             # Español
//                       wdt:P18 ?image;             # Imagen
//                       ?item wikibase:sitelinks ?links.
//                 SERVICE wikibase:label {
//                   bd:serviceParam wikibase:language "es".
//                 }
//               } LIMIT 200
//             }
//           }
//           ORDER BY DESC(?links)
//           LIMIT ${outerLimit}
//         `
//       },
//       {
//         category: "Científicos",
//         statement: "¿Quién es este científico?",
//         sparql: `
//           SELECT DISTINCT ?itemLabel ?image (?itemLabel AS ?answerLabel) WHERE {
//             {
//               SELECT ?item ?itemLabel ?image WHERE {
//                 ?item wdt:P31 wd:Q5;                # Humano
//                       wdt:P106 ?occupation;         # Ocupación
//                       wdt:P18 ?image.               # Imagen
//                 ?occupation wdt:P279* wd:Q901.     # Subclase de científico
//                 SERVICE wikibase:label {
//                   bd:serviceParam wikibase:language "es".
//                 }
//               } LIMIT 200
//             }
//           }
//           ORDER BY RAND()
//           LIMIT ${outerLimit}
//         `
//       }
//     ];
//   }
  
//   module.exports = getQueries;
  






// src/utils/queries.js

/**
 * Devuelve una consulta SPARQL personalizada para cada tipo de entidad con detalles únicos.
 * @param {string} entityType - Tipo de entidad (por ejemplo, "Q5", "Q3305213", "Q6256", etc.)
 * @param {string} category - Nombre de la categoría (por ejemplo, "Lugares", "Arte", etc.)
 * @param {string} statement - Descripción de la pregunta (por ejemplo, "¿A qué lugar corresponde la siguiente foto?")
 * @param {number} outerLimit - Número de resultados finales por query
 * @param {string} additionalQuery - Consultas adicionales específicas de cada entidad (como FILTER, BIND, etc.)
 * @returns {object} - Objeto con category, statement, y la consulta SPARQL generada
 */
function createQuery(whereParameter, category, statement, outerLimit) {
  const baseQuery = `
    SELECT DISTINCT ?itemLabel ?image (?itemLabel AS ?answerLabel) WHERE {
      {
        SELECT ?item ?itemLabel ?image WHERE {
          ?item ${whereParameter}
          SERVICE wikibase:label {
            bd:serviceParam wikibase:language "es".
          }
        } LIMIT 200
      }
    }
    ORDER BY RAND()
    LIMIT ${outerLimit}
  `;

  return {
    category: category,
    statement: statement,
    sparql: baseQuery
  };
}
function createQuery(whereParameter, category, statement, outerLimit) {
  const baseQuery = `
    SELECT DISTINCT ?itemLabel ?image (?itemLabel AS ?answerLabel) WHERE {
      {
        SELECT ?item ?itemLabel ?image WHERE {
          ${whereParameter}
          SERVICE wikibase:label {
            bd:serviceParam wikibase:language "es".
          }
        } LIMIT 200
      }
    }
    ORDER BY RAND()
    LIMIT ${outerLimit}
  `;

  return {
    category,
    statement,
    sparql: baseQuery
  };
}

function getQueries(outerLimit) {
  return [
    createQuery(`
      ?item wdt:P31 wd:Q515;
            wdt:P18 ?image;
            wdt:P17 ?answer.
    `, 'Lugares', '¿A qué lugar corresponde la siguiente foto?', outerLimit),

    createQuery(`
      ?item wdt:P31 wd:Q3305213;
            wdt:P18 ?image.
    `, 'Arte', '¿Cuál es el nombre de la obra?', outerLimit),

    createQuery(`
      ?item wdt:P31 wd:Q5;
            wdt:P106 wd:Q33999;
            wdt:P18 ?image.
    `, 'Actores', '¿Quién es este actor?', outerLimit),

    createQuery(`
      ?item wdt:P31 wd:Q5;
            wdt:P106 wd:Q177220;
            wdt:P18 ?image.
    `, 'Cantantes', '¿Quién es este cantante?', outerLimit),

    createQuery(`
      ?item wdt:P31 wd:Q3305213;
            wdt:P18 ?image;
            wdt:P170 ?answer.
    `, 'Pintores', '¿Quién es el autor de esta obra?', outerLimit),

    createQuery(`
      ?item wdt:P31 wd:Q5;
            wdt:P106 wd:Q937857;
            wdt:P18 ?image.
      ?item p:P54 ?teamStatement.
      ?teamStatement pq:P580 ?startDate.
      FILTER(YEAR(?startDate) > 1980)
    `, 'Futbolistas', '¿Quién es este futbolista?', outerLimit),

    createQuery(`
      ?item wdt:P31 wd:Q6256;
            wdt:P41 ?image.
    `, 'Banderas', '¿De qué país es esta bandera?', outerLimit),

    createQuery(`
      ?item wdt:P31 wd:Q5;
            wdt:P106 wd:Q4964182;
            wdt:P18 ?image.
    `, 'Filosofos', '¿Quién es este filósofo?', outerLimit),

    createQuery(`
      ?item wdt:P31 wd:Q5;
            wdt:P106 wd:Q2066131;
            wdt:P27 wd:Q29;
            wdt:P18 ?image.
    `, 'DeportistasEspañoles', '¿Quién es este deportista español?', outerLimit),

    createQuery(`
      ?item wdt:P31 wd:Q5;
            wdt:P106 ?occupation;
            wdt:P18 ?image.
      ?occupation wdt:P279* wd:Q901.
    `, 'Científicos', '¿Quién es este científico?', outerLimit)
  ];
}

module.exports = getQueries;
