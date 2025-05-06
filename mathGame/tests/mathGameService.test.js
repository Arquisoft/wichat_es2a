const { generateExpression, generateOptions } = require('../service/mathGameService.js');

// Auxiliar para evitar duplicación de lógica
function calculateExpected(a, op, b) {
  switch (op) {
    case '+': return Number(a) + Number(b);
    case '-': return Number(a) - Number(b);
    case '*': return Number(a) * Number(b);
    default: throw new Error('Unexpected operator: ' + op);
  }
}

describe('generateExpression', () => {
  it('should generate a valid expression for the first question', () => {
    const { expr, result } = generateExpression(null);
    expect(typeof expr).toBe('string');
    expect(expr).toMatch(/^\d+ [+\-*] \d+$/);
    const [a, op, b] = expr.split(' ');
    const expected = calculateExpected(a, op, b);
    expect(result).toBe(expected);
  });

  it('should generate an expression starting from a given baseValue', () => {
    const base = 10;
    const { expr, result } = generateExpression(base);
    expect(expr).toMatch(/^10 [+\-*] \d+$/);
    const [a, op, b] = expr.split(' ');
    const expected = calculateExpected(a, op, b);
    expect(result).toBe(expected);
  });

  it('should use all allowed operators over multiple calls', () => {
    const opsSeen = new Set();
    for (let i = 0; i < 50; i++) {
      const { expr } = generateExpression(null);
      const op = expr.split(' ')[1];
      opsSeen.add(op);
    }
    expect(opsSeen).toEqual(new Set(['+', '-', '*']));
  });

  it('should handle baseValue = 0 correctly', () => {
    const { expr, result } = generateExpression(0);
    expect(expr).toMatch(/^0 [+\-*] \d+$/);
    const [a, op, b] = expr.split(' ');
    const expected = calculateExpected(a, op, b);
    expect(result).toBe(expected);
  });

  it('should handle negative baseValue correctly', () => {
    const base = -5;
    const { expr, result } = generateExpression(base);
    expect(expr.startsWith('-5 ')).toBe(true);
    const [a, op, b] = expr.split(' ');
    const expected = calculateExpected(a, op, b);
    expect(result).toBe(expected);
  });
});

describe('deterministic behavior when Math.random is stubbed', () => {
  let originalRandom;
  beforeAll(() => {
    originalRandom = Math.random;
    Math.random = () => 0;  // always 0
  });
  afterAll(() => {
    Math.random = originalRandom;
  });

  it('generateExpression(null) always yields "1 + 1" when random=0', () => {
    const { expr, result } = generateExpression(null);
    expect(expr).toBe('1 + 1');
    expect(result).toBe(2);
  });
});

describe('generateOptions', () => {
  it('should return exactly 4 unique options including the correct one', () => {
    const correct = 25;
    const opts = generateOptions(correct);
    expect(Array.isArray(opts)).toBe(true);
    expect(opts).toHaveLength(4);
    expect(opts).toContain(correct);
    expect(new Set(opts).size).toBe(4);
  });

  it('distractors should be within ±10 of correct', () => {
    const correct = 30;
    const opts = generateOptions(correct);
    opts.forEach(opt => {
      expect(opt).toBeGreaterThanOrEqual(correct - 10);
      expect(opt).toBeLessThanOrEqual(correct + 10);
    });
  });

  it('handles negative correct values', () => {
    const correct = -7;
    const opts = generateOptions(correct);
    expect(opts).toHaveLength(4);
    expect(opts).toContain(correct);
    opts.forEach(opt => {
      expect(Number.isInteger(opt)).toBe(true);
    });
  });

  it('returns varied sets across multiple calls (non-deterministic)', () => {
    const correct = 50;
    const first = generateOptions(correct).join(',');
    let foundDifferent = false;
    for (let i = 0; i < 5; i++) {
      if (generateOptions(correct).join(',') !== first) {
        foundDifferent = true;
        break;
      }
    }
    expect(foundDifferent).toBe(true);
  });

  it('never returns NaN or undefined values', () => {
    const opts = generateOptions(3);
    opts.forEach(opt => {
      expect(opt).not.toBeNaN();
      expect(opt).not.toBe(undefined);
    });
  });

  it('returns options in random order (mostly)', () => {
    // Very small chance of flake, but test for shuffle
    const correct = 5;
    const sorted = [correct, correct+1, correct-1, correct+2].sort().join(',');
    let randomOrderDetected = false;
    for (let i = 0; i < 5; i++) {
      const opts = generateOptions(correct);
      if (opts.join(',') !== sorted) {
        randomOrderDetected = true;
        break;
      }
    }
    expect(randomOrderDetected).toBe(true);
  });
});