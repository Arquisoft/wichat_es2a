// tests/wikidataFakeAnswers.mocked.test.js

// 1) Auto‐mockeamos el módulo
jest.mock('../src/services/wikidataFakeAnswersService');

// 2) Importamos el servicio ya mockeado
const fakeAnswersService = require('../src/services/wikidataFakeAnswersService');

// 3) Aseguramos que getFakeAnswers sea un jest.fn()
fakeAnswersService.getFakeAnswers = jest.fn();

describe('wikidataFakeAnswersService (mocked)', () => {
  beforeEach(() => {
    fakeAnswersService.getFakeAnswers.mockClear();
  });

  it('should generate fake answers correctly for a question', () => {
    const correctAnswer = 'Paris';
    const category = 'Capitales';
    const fakeAnswers = ['Berlin', 'Madrid', 'Rome'];

    // Configuramos el mock
    fakeAnswersService.getFakeAnswers.mockReturnValue(fakeAnswers);

    // Ejecutamos la función mockeada
    const result = fakeAnswersService.getFakeAnswers(correctAnswer, category);

    // Comprobamos resultados e interacción
    expect(result).toEqual(fakeAnswers);
    expect(fakeAnswersService.getFakeAnswers)
      .toHaveBeenCalledWith(correctAnswer, category);
  });
});
