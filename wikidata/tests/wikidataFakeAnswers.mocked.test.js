jest.mock('../src/services/wikidataFakeAnswersService');

const fakeAnswersService = require('../src/services/wikidataFakeAnswersService');

fakeAnswersService.getFakeAnswers = jest.fn();

describe('wikidataFakeAnswersService (mocked)', () => {
  beforeEach(() => {
    fakeAnswersService.getFakeAnswers.mockClear();
  });

  it('should generate fake answers correctly for a question', () => {
    const correctAnswer = 'Paris';
    const category = 'Capitales';
    const fakeAnswers = ['Berlin', 'Madrid', 'Rome'];

    fakeAnswersService.getFakeAnswers.mockReturnValue(fakeAnswers);

    const result = fakeAnswersService.getFakeAnswers(correctAnswer, category);

    expect(result).toEqual(fakeAnswers);
    expect(fakeAnswersService.getFakeAnswers)
      .toHaveBeenCalledWith(correctAnswer, category);
  });
});
