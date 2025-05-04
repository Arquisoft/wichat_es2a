const getQueries = require('../src/model/wikidataQueries');

describe('getQueries', () => {
  it('should be a function', () => {
    expect(typeof getQueries).toBe('function');
  });

  it('should return an array with 9 queries', () => {
    const queries = getQueries(50);
    expect(Array.isArray(queries)).toBe(true);
    expect(queries.length).toBe(9);
  });

  it('should return queries with correct structure', () => {
    const queries = getQueries(50);
    queries.forEach((query) => {
      expect(query).toHaveProperty('category');
      expect(query).toHaveProperty('statement');
      expect(query).toHaveProperty('sparql');
      expect(typeof query.category).toBe('string');
      expect(typeof query.statement).toBe('string');
      expect(typeof query.sparql).toBe('string');
    });
  });

  it('should interpolate the correct outerLimit in the SPARQL queries', () => {
    const limit = 123;
    const queries = getQueries(limit);
    queries.forEach((query) => {
      expect(query.sparql.includes(`LIMIT ${limit}`)).toBe(true);
    });
  });

  it('should work with different outerLimit values', () => {
    const smallLimit = 5;
    const largeLimit = 500;

    const queriesSmall = getQueries(smallLimit);
    const queriesLarge = getQueries(largeLimit);

    queriesSmall.forEach((query) => {
      expect(query.sparql.includes(`LIMIT ${smallLimit}`)).toBe(true);
    });

    queriesLarge.forEach((query) => {
      expect(query.sparql.includes(`LIMIT ${largeLimit}`)).toBe(true);
    });
  });
});
