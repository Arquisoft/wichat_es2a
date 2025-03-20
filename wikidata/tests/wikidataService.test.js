const service = require('../src/services/wikidataService');
const repository = require('../src/repositories/wikidataRepository');
const fakeAnswers = require('../src/services/wikidataFakeAnswersService');

// Mock de la interacción con el repositorio y otras funciones
jest.mock('../src/repositories/wikidataRepository');
jest.mock('../src/services/wikidataFakeAnswersService');
jest.mock('node-fetch', () => jest.fn());

describe('wikidataService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch questions from Wikidata and insert them if they do not exist', async () => {
    const category = 'Science';
    const questions = [{ id: 1, question: 'What is science?' }];
    
    // Mock de la función de repositorio
    repository.existsQuestions.mockResolvedValue(false);  // No existen preguntas en la base de datos
    repository.insertQuestions.mockResolvedValue(undefined); // Inserción correcta
    repository.getQuestions.mockResolvedValue(questions);

    // Mock de la función fetchQuestionsFromWikidata
    service.fetchQuestionsFromWikidata = jest.fn().mockResolvedValue(questions);

    const result = await service.getQuestions(category, 1);

    expect(repository.existsQuestions).toHaveBeenCalledWith(category);
    expect(repository.insertQuestions).toHaveBeenCalledWith(questions);
    expect(result).toEqual(questions); // Esperamos que se devuelvan las preguntas
  });

  it('should return questions from the database if they exist', async () => {
    const category = 'History';
    const questions = [{ id: 2, question: 'Who was the first president?' }];

    // Simulamos que las preguntas ya existen
    repository.existsQuestions.mockResolvedValue(true);
    repository.getQuestions.mockResolvedValue(questions);

    const result = await service.getQuestions(category, 1);

    expect(repository.existsQuestions).toHaveBeenCalledWith(category);
    expect(repository.insertQuestions).not.toHaveBeenCalled(); // No debe llamarse
    expect(result).toEqual(questions); // Las preguntas deben ser las obtenidas de la base de datos
  });

  it('should check if the user answer is correct', async () => {
    const userOption = 'Option A';
    const correctAnswer = 'Option A';

    const isCorrect = await service.checkCorrectAnswer(userOption, correctAnswer);

    expect(isCorrect).toBe(true); // La respuesta debería ser correcta
  });

  it('should return false if the user answer is incorrect', async () => {
    const userOption = 'Option B';
    const correctAnswer = 'Option A';

    const isCorrect = await service.checkCorrectAnswer(userOption, correctAnswer);

    expect(isCorrect).toBe(false); // La respuesta debería ser incorrecta
  });

  it('should clear all questions from the database', async () => {
    // Mock de la función deleteQuestions
    repository.deleteQuestions.mockResolvedValue(undefined);

    await service.clearAllQuestions();

    expect(repository.deleteQuestions).toHaveBeenCalled(); // Verificamos que se haya llamado a la función para borrar todas las preguntas
  });
});
