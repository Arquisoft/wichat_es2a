/**
 * Genera una expresión matemática a partir de un valor base (o null para la primera)
 * @param {number|null} baseValue
 * @returns {{expr: string, result: number}}
 */
export function generateExpression(baseValue) {
    const ops = ['+', '-', '*'];
    if (baseValue == null) {
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      const op = ops[Math.floor(Math.random() * ops.length)];
      const expr = `${a} ${op} ${b}`;
      return { expr, result: eval(expr) };
    }
    const c = Math.floor(Math.random() * 9) + 1;
    const op = ops[Math.floor(Math.random() * ops.length)];
    const expr = `${baseValue} ${op} ${c}`;
    return { expr, result: eval(expr) };
  }
  
  /**
   * Genera un array de 4 opciones: la correcta y tres distractores
   * @param {number} correct
   * @returns {number[]}
   */
  export function generateOptions(correct) {
    const options = new Set([correct]);
    while (options.size < 4) {
      const delta = Math.floor(Math.random() * 10) + 1;
      const sign = Math.random() < 0.5 ? -1 : 1;
      options.add(correct + sign * delta);
    }
    return Array.from(options).sort(() => Math.random() - 0.5);
  }
  