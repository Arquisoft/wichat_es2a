const fakeAnswers = require("../src/service/wikidataFakeAnswersService");
const answers = require("../src/model/wikidataFakeAnswers");

jest.mock("../src/model/wikidataFakeAnswers", () => [
    { category: "Actor", answers: ["Brad Pitt", "Leonardo DiCaprio", "Tom Hanks", "Johnny Depp", "Robert De Niro"] },
    { category: "Singer", answers: ["Adele", "Beyoncé", "Rihanna", "Lady Gaga", "Elvis Presley"] },
    { category: "Movie", answers: ["Titanic", "Inception", "The Matrix", "Interstellar", "Pulp Fiction"] }
]);

describe("Fake Answers Generator", () => {
    it("should return an array with 3 fake answers", () => {
        const result = fakeAnswers.getFakeAnswers("Brad Pitt", "Actor");
        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBe(3);
    });

    it("should not include the correct answer in the fake answers", () => {
        const correctAnswer = "Adele";
        const result = fakeAnswers.getFakeAnswers(correctAnswer, "Singer");
        expect(result).not.toContain(correctAnswer);
    });

    it("should return different fake answers", () => {
        const result = fakeAnswers.getFakeAnswers("Titanic", "Movie");
        const uniqueAnswers = new Set(result);
        expect(uniqueAnswers.size).toBe(3);
    });

    it("should return an empty array if category does not exist", () => {
        const result = fakeAnswers.getFakeAnswers("Random Name", "NonExistentCategory");
        expect(result).toEqual([]);
    });

    it("should not fail if the category has very few options", () => {
        jest.mock("../model/wikidataFakeAnswers", () => [
            { category: "UniqueCategory", answers: ["OnlyAnswer"] }
        ]);

        const result = fakeAnswers.getFakeAnswers("OnlyAnswer", "UniqueCategory");
        expect(result.length).toBe(0); 
    });
});
