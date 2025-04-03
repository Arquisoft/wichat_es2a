const service = require('../src/services/wikidataService');
const repository = require('../src/repositories/wikidataRepository');
const fakeAnswers = require('../src/services/wikidataFakeAnswersService');
const queries = require('../src/model/wikidataQueries'); 
const fetch = require('node-fetch');

jest.mock('../src/repositories/wikidataRepository');
jest.mock('../src/services/wikidataFakeAnswersService');
jest.mock('node-fetch', () => jest.fn());
jest.mock('../src/model/wikidataQueries', () => ({
  find: jest.fn(), 
  queries: [ 
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
  ]
}));

describe('wikidataService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('should fetch questions from Wikidata', async () => {
    const category = 'Lugares';
    const mockQuery = {
      category: category,
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
    };
    const mockData = {
      results: {
        bindings: [
          { answerLabel: { value: 'Paris' }, image: { value: 'image1.png' } },
        ]
      }
    };

    queries.find.mockReturnValue(mockQuery);

    fetch.mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData)
      })
    );

    fakeAnswers.getFakeAnswers.mockReturnValue(['Paris', 'Berlin', 'Madrid', 'Rome']);

    const questions = await service.fetchQuestionsFromWikidata(category);

    expect(questions).toEqual([{
      statements: mockQuery.statement,
      answer: 'Paris',
      image: 'image1.png',
      category: category,
      options: ['Paris', 'Berlin', 'Madrid', 'Rome']
    }]);
  });

  it('should handle errors when fetching questions from Wikidata', async () => {
    const category = 'Lugares';
    const mockQuery = {
      category: category,
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
    };

    // Mock the find function
    queries.find.mockReturnValue(mockQuery);

    // Mock failed fetch response
    fetch.mockImplementation(() => 
      Promise.resolve({
        ok: false,
        status: 500
      })
    );

    const questions = await service.fetchQuestionsFromWikidata(category);

    expect(questions).toEqual([]);
    expect(console.error).toHaveBeenCalled();
  });

  it('should get a question from the database or fetch from Wikidata if not found', async () => {
    const category = 'science';
    const mockQuestion = [{ _id: '123', statements: 'What is the capital of France?', answer: 'Paris', image: 'image.png' }];
    
    repository.existsQuestions.mockResolvedValue(false);
    service.fetchQuestionsFromWikidata = jest.fn().mockResolvedValue(mockQuestion);
    repository.insertQuestions.mockResolvedValue(undefined);
    repository.getQuestions.mockResolvedValue(mockQuestion);

    const question = await service.getQuestion(category);

    expect(repository.existsQuestions).toHaveBeenCalledWith(category);
    expect(service.fetchQuestionsFromWikidata).toHaveBeenCalledWith(category);
    expect(repository.insertQuestions).toHaveBeenCalledWith(mockQuestion);
    expect(question).toEqual(mockQuestion);
  });

  it('should get n questions from the database', async () => {
    const category = 'science';
    const n = 5;
    const mockQuestions = [
      { _id: '123', statements: 'What is the capital of France?', answer: 'Paris', image: 'image.png' },
      { _id: '124', statements: 'What is the capital of Spain?', answer: 'Madrid', image: 'image2.png' },
    ];

    service.fetchQuestionsFromWikidata = jest.fn().mockResolvedValue(mockQuestions);
    repository.insertQuestions.mockResolvedValue(undefined);

    const questions = await service.getQuestions(category, n);

    expect(questions).toEqual(mockQuestions);
    expect(repository.insertQuestions).toHaveBeenCalledWith(mockQuestions);
  });

  it('should get all questions from the database', async () => {
    const mockQuestions = [
      { _id: '123', statements: 'What is the capital of France?', answer: 'Paris', image: 'image.png' },
      { _id: '124', statements: 'What is the capital of Spain?', answer: 'Madrid', image: 'image2.png' },
    ];

    repository.getAllQuestions.mockResolvedValue(mockQuestions);

    const questions = await service.getAllQuestions();

    expect(questions).toEqual(mockQuestions);
    expect(repository.getAllQuestions).toHaveBeenCalled();
  });

  it('should get all questions from the database by category', async () => {
    const category = 'science';
    const mockQuestions = [
      { _id: '123', statements: 'What is the capital of France?', answer: 'Paris', image: 'image.png' },
      { _id: '124', statements: 'What is the capital of Spain?', answer: 'Madrid', image: 'image2.png' },
    ];

    repository.getAllQuestionsFromCategory.mockResolvedValue(mockQuestions);

    const questions = await service.getAllQuestionsFromCategory(category);

    expect(questions).toEqual(mockQuestions);
    expect(repository.getAllQuestionsFromCategory).toHaveBeenCalledWith(category);
  });

  it('should delete questions from the database', async () => {
    const mockQuestions = [{ _id: '123' }, { _id: '124' }];
    repository.deleteQuestion.mockResolvedValue(undefined);

    await service.deleteQuestions(mockQuestions);

    expect(repository.deleteQuestion).toHaveBeenCalledTimes(mockQuestions.length);
    expect(repository.deleteQuestion).toHaveBeenCalledWith(mockQuestions[0]._id);
    expect(repository.deleteQuestion).toHaveBeenCalledWith(mockQuestions[1]._id);
  });

  it('should check if the user answer is correct', async () => {
    const userOption = 'Option A';
    const correctAnswer = 'Option A';

    const isCorrect = await service.checkCorrectAnswer(userOption, correctAnswer);

    expect(isCorrect).toBe(true); 
  });

  it('should return false if the user answer is incorrect', async () => {
    const userOption = 'Option B';
    const correctAnswer = 'Option A';

    const isCorrect = await service.checkCorrectAnswer(userOption, correctAnswer);

    expect(isCorrect).toBe(false); 
  });

  it('should clear all questions from the database', async () => {
    repository.deleteQuestions.mockResolvedValue(undefined);

    await service.clearAllQuestions();

    expect(repository.deleteQuestions).toHaveBeenCalled(); 
  });
});
