const service = require('../src/services/wikidataService');
const repository = require('../src/repositories/wikidataRepository');
const fakeAnswers = require('../src/services/wikidataFakeAnswersService');

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
    
    repository.existsQuestions.mockResolvedValue(false); 
    repository.insertQuestions.mockResolvedValue(undefined);
    repository.getQuestions.mockResolvedValue(questions);

    service.fetchQuestionsFromWikidata = jest.fn().mockResolvedValue(questions);

    const result = await service.getQuestions(category, 1);

    expect(repository.existsQuestions).toHaveBeenCalledWith(category);
    expect(repository.insertQuestions).toHaveBeenCalledWith(questions);
    expect(result).toEqual(questions); 
  });

  it('should return questions from the database if they exist', async () => {
    const category = 'History';
    const questions = [{ id: 2, question: 'Who was the first president?' }];

    repository.existsQuestions.mockResolvedValue(true);
    repository.getQuestions.mockResolvedValue(questions);

    const result = await service.getQuestions(category, 1);

    expect(repository.existsQuestions).toHaveBeenCalledWith(category);
    expect(repository.insertQuestions).not.toHaveBeenCalled(); 
    expect(result).toEqual(questions); 
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
