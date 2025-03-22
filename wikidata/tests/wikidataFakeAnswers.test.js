const fakeAnswersService = require('../src/services/wikidataFakeAnswersService');

jest.mock('../src/services/wikidataFakeAnswersService');

describe('wikidataFakeAnswersService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate fake answers correctly for a question', async () => {
    const correctAnswer = 'Paris';
    const category = 'Capitales';
    const fakeAnswers = ['Berlin', 'Madrid', 'Rome'];

    fakeAnswersService.getFakeAnswers.mockResolvedValue(fakeAnswers);

    const result = await fakeAnswersService.getFakeAnswers(correctAnswer, category);

    expect(result).toEqual(fakeAnswers); 
    expect(fakeAnswersService.getFakeAnswers).toHaveBeenCalledWith(correctAnswer, category);
  });
});
