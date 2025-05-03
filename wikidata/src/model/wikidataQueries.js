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
