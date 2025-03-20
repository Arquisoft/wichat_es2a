const repository = require('../src/repositories/wikidataRepository');

jest.mock('../src/repositories/wikidataRepository');

describe('wikidataRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should check if questions exist in the database', async () => {
    const category = 'Science';
    repository.existsQuestions.mockResolvedValue(true);

    const result = await repository.existsQuestions(category);

    expect(result).toBe(true); 
    expect(repository.existsQuestions).toHaveBeenCalledWith(category);
  });

  it('should insert questions into the database', async () => {
    const questions = [{ id: 1, question: 'What is science?' }];

    repository.insertQuestions.mockResolvedValue(undefined);

    await repository.insertQuestions(questions);

    expect(repository.insertQuestions).toHaveBeenCalledWith(questions); 
  });

  it('should get questions from the database', async () => {
    const category = 'Science';
    const questions = [{ id: 1, question: 'What is science?' }];

    repository.getQuestions.mockResolvedValue(questions);

    const result = await repository.getQuestions(category, 1);

    expect(result).toEqual(questions); 
  });

  it('should delete questions from the database', async () => {
    const question = { _id: '123', question: 'What is science?' };

    repository.deleteQuestion.mockResolvedValue(undefined);

    await repository.deleteQuestion(question._id);

    expect(repository.deleteQuestion).toHaveBeenCalledWith(question._id); 
  });
});
