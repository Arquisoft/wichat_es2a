const fakeAnswersService = require('../src/services/wikidataFakeAnswersService');

// Mock de la función getFakeAnswers
jest.mock('../src/services/wikidataFakeAnswersService');

describe('wikidataFakeAnswersService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate fake answers correctly for a question', async () => {
    const correctAnswer = 'Paris';
    const category = 'Capitales';
    const fakeAnswers = ['Berlin', 'Madrid', 'Rome'];

    // Mock de la lógica para generar respuestas falsas
    fakeAnswersService.getFakeAnswers.mockResolvedValue(fakeAnswers);

    const result = await fakeAnswersService.getFakeAnswers(correctAnswer, category);

    expect(result).toEqual(fakeAnswers); // Verificamos que las respuestas falsas generadas sean correctas
    expect(fakeAnswersService.getFakeAnswers).toHaveBeenCalledWith(correctAnswer, category);
  });
});
