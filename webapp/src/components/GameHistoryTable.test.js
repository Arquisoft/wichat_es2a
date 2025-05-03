const React = require('react');
const { render, screen } = require('@testing-library/react');
const GameHistoryTable = require('./GameHistoryTable').default;

const sampleGame = {
    totalQuestions: 10,
    answered: 8,
    category: 'Ciencia',
    level: 'Fácil',
    correct: 6,
    wrong: 2,
    points: 120,
    duration: 45,
    createdAt: '2025-05-03',
};

describe('GameHistoryTable', () => {
    it('renders the table header correctly', () => {
        render(React.createElement(GameHistoryTable, { gameHistory: [] }));
        expect(screen.getByText(/Historial de Partidas/i)).toBeTruthy();
        expect(screen.getByText(/Preguntas totales/i)).toBeTruthy();
        expect(screen.getByText(/Categoria/i)).toBeTruthy();
        expect(screen.getByText(/Duración/)).toBeTruthy();
    });

    it('shows message if there are no games', () => {
        render(React.createElement(GameHistoryTable, { gameHistory: [] }));
        expect(screen.getByText(/No hay partidas registradas/i)).toBeTruthy();
    });

    it('renders a row for each game', () => {
        render(React.createElement(GameHistoryTable, { gameHistory: [sampleGame, { ...sampleGame, category: 'Historia', correct: 8 }] }));
        expect(screen.getAllByRole('row').length).toBeGreaterThan(2); 
        expect(screen.getByText('Ciencia')).toBeTruthy();
        expect(screen.getByText('Historia')).toBeTruthy();
        expect(screen.getAllByText('8').length).toBeGreaterThan(0); 
    });

    it('renders empty cells if fields are missing', () => {
        render(React.createElement(GameHistoryTable, { gameHistory: [{}, {}] }));
        const cells = screen.getAllByRole('cell');
        expect(cells.some(cell => cell.textContent === '')).toBe(true);
    });

    it('applies styles and renders icons in header', () => {
        render(React.createElement(GameHistoryTable, { gameHistory: [] }));
        expect(screen.getByText(/Correctas/)).toBeTruthy();
        expect(screen.getByText(/Erróneas/)).toBeTruthy();
        expect(screen.getByText(/Fecha/)).toBeTruthy();
    });
});
