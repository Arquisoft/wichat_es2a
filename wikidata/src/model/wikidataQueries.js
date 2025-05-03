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
function createQuery(entityType, category, statement, outerLimit, additionalQuery = '') {
  const baseQuery = `
    SELECT DISTINCT ?itemLabel ?image (?itemLabel AS ?answerLabel) WHERE {
      {
        SELECT ?item ?itemLabel ?image WHERE {
          ?item wdt:P31 ${entityType};      # Tipo de entidad
                wdt:P18 ?image.             # Imagen
          SERVICE wikibase:label {
            bd:serviceParam wikibase:language "es".
          }
        } LIMIT 200
      }
      ${additionalQuery}
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

/**
 * Devuelve el array de queries con el LIMIT exterior personalizado.
 * @param {number} outerLimit — número de resultados finales por query
 */
function getQueries(outerLimit) {
  return [
    createQuery('wd:Q515', 'Lugares', '¿A qué lugar corresponde la siguiente foto?', outerLimit),
    createQuery('wd:Q3305213', 'Arte', '¿Cuál es el nombre de la obra?', outerLimit),
    createQuery('wd:Q5', 'Actores', '¿Quién es este actor?', outerLimit, `
      FILTER EXISTS { ?item wdt:P106 wd:Q33999 }   # Actor
    `),
    createQuery('wd:Q177220', 'Cantantes', '¿Quién es este cantante?', outerLimit, `
      FILTER EXISTS { ?item wdt:P106 wd:Q177220 }  # Cantante
    `),
    createQuery('wd:Q3305213', 'Pintores', '¿Quién es el autor de esta obra?', outerLimit, `
      ?item wdt:P170 ?answer.                      # Autor
    `),
    createQuery('wd:Q937857', 'Futbolistas', '¿Quién es este futbolista?', outerLimit, `
      ?item p:P54 ?teamStatement;       # Miembro de equipo
      ?teamStatement pq:P580 ?startDate.
      FILTER(YEAR(?startDate) > 1980)
    `),
    createQuery('wd:Q6256', 'Banderas', '¿De qué país es esta bandera?', outerLimit),
    createQuery('wd:Q4964182', 'Filosofos', '¿Quién es este filósofo?', outerLimit, `
      FILTER EXISTS { ?item wdt:P106 wd:Q4964182 }  # Filósofo
    `),
    createQuery('wd:Q2066131', 'DeportistasEspañoles', '¿Quién es este deportista español?', outerLimit, `
      ?item wdt:P27 wd:Q29;             # Español
      ?item wikibase:sitelinks ?links.
    `),
    createQuery('wd:Q901', 'Científicos', '¿Quién es este científico?', outerLimit, `
      ?occupation wdt:P279* wd:Q901.     # Subclase de científico
    `)
  ];
}

module.exports = getQueries;
