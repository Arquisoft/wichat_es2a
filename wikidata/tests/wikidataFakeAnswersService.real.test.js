jest.resetModules();

jest.doMock('../src/model/wikidataFakeAnswers', () => [
  { category: 'TestCat', answers: ['A', 'B', 'C', 'D', 'E'] }
]);

jest.unmock('../src/services/wikidataFakeAnswersService');
const realFakeAnswersService = require('../src/services/wikidataFakeAnswersService');

describe('wikidataFakeAnswersService.getFakeAnswers (real implementation)', () => {
  const testCategory = 'TestCat';
  const testAnswers = ['A', 'B', 'C', 'D', 'E'];

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('devuelve 3 respuestas únicas y distintas, sin incluir la correcta', () => {
    const correct = 'B';
    const len = testAnswers.length;
    const startIdx = testAnswers.indexOf(correct);
    const seq = [
      startIdx / len,
      ((startIdx + 1) % len) / len,
      ((startIdx + 2) % len) / len,
      ((startIdx + 3) % len) / len
    ];
    let calls = 0;
    jest.spyOn(Math, 'random').mockImplementation(() => seq[calls++]);

    const fakes = realFakeAnswersService.getFakeAnswers(correct, testCategory);
    const expected = [
      testAnswers[(startIdx + 1) % len],
      testAnswers[(startIdx + 2) % len],
      testAnswers[(startIdx + 3) % len]
    ];

    expect(fakes).toEqual(expected);
    expect(fakes).toHaveLength(3);
    expect(fakes).not.toContain(correct);
    expect(new Set(fakes).size).toBe(3);
  });

  it('si correctAnswer no está en la lista, devuelve 3 válidas', () => {
    const correct = 'Z';
    const len = testAnswers.length;
    jest.spyOn(Math, 'random')
      .mockImplementationOnce(() => 0)
      .mockImplementationOnce(() => 1 / len)
      .mockImplementationOnce(() => 2 / len)
      .mockImplementation(() => 3 / len);

    const fakes = realFakeAnswersService.getFakeAnswers(correct, testCategory);

    expect(fakes).toHaveLength(3);
    fakes.forEach(ans => expect(testAnswers).toContain(ans));
    expect(new Set(fakes).size).toBe(3);
  });

  it('categoría inexistente → array vacío y log de error', () => {
    const spyErr = jest.spyOn(console, 'error').mockImplementation(() => {});
    const fakes = realFakeAnswersService.getFakeAnswers('X', 'NoExiste');

    expect(fakes).toEqual([]);
    expect(spyErr).toHaveBeenCalledWith(
      'Category NoExiste not found in the fake answers'
    );
    spyErr.mockRestore();
  });
});
