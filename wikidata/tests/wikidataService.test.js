const service = require("../src/services/wikidataService");
const repository = require("../src/repositories/wikidataRepository");
const fakeAnswers = require("../src/services/wikidataFakeAnswersService");
const queries = require("../src/model/wikidataQueries");
const fakeAnswersData = require("../src/model/wikidataFakeAnswers");

jest.mock("../src/model/wikidataFakeAnswers", () => [
    { category: "Actores", answers: ["Brad Pitt", "Leonardo DiCaprio", "Tom Hanks", "Johnny Depp", "Robert De Niro"] },
    { category: "Cantantes", answers: ["Adele", "Beyoncé", "Rihanna", "Lady Gaga", "Elvis Presley"] },
    { category: "Películas", answers: ["Titanic", "Inception", "The Matrix", "Interstellar", "Pulp Fiction"] },
    { category: "Lugares", answers: ["Titanic", "Inception", "The Matrix", "Interstellar", "Pulp Fiction"] },
    { category: "Arte", answers: ["Titanic", "Inception", "The Matrix", "Interstellar", "Pulp Fiction"] }

]);

jest.mock("../src/repositories/wikidataRepository");
jest.mock("../src/services/wikidataFakeAnswersService");
jest.mock("../src/model/wikidataQueries", () => [
    {
        category: "Lugares",
        statement: "¿A qué lugar corresponde la siguiente foto?",
        sparql: "SELECT ?itemLabel ?image ?answerLabel WHERE { ?item wdt:P31 wd:Q515; wdt:P18 ?image; wdt:P17 ?answer. SERVICE wikibase:label { bd:serviceParam wikibase:language 'es'. } } LIMIT 20"
    },
    {
        category: "Arte",
        statement: "¿Quién es el autor de esta obra?",
        sparql: "SELECT ?itemLabel ?image ?answerLabel WHERE { ?item wdt:P31 wd:Q3305213; wdt:P18 ?image; wdt:P170 ?answer. SERVICE wikibase:label { bd:serviceParam wikibase:language 'es'. } } LIMIT 3"
    },
    {
        category: "Actores",
        statement: "¿Quién es este actor?",
        sparql: "SELECT ?itemLabel ?image WHERE { ?item wdt:P31 wd:Q5; wdt:P18 ?image. SERVICE wikibase:label { bd:serviceParam wikibase:language 'es'. } } LIMIT 5"
    },
    {
        category: "Cantantes",
        statement: "¿Quién es este cantante?",
        sparql: "SELECT ?itemLabel ?image WHERE { ?item wdt:P31 wd:Q5; wdt:P106 wd:Q177220; wdt:P18 ?image. SERVICE wikibase:label { bd:serviceParam wikibase:language 'es'. } } LIMIT 5"
    },
    {
        category: "Películas",
        statement: "¿Qué película es esta?",
        sparql: "SELECT ?itemLabel ?image WHERE { ?item wdt:P31 wd:Q11424; wdt:P18 ?image. SERVICE wikibase:label { bd:serviceParam wikibase:language 'es'. } } LIMIT 5"
    }
]);

describe("Wikidata Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it.each([
        ["Lugares", "París", "https://example.com/paris.jpg"],
        ["Arte", "Leonardo da Vinci", "https://example.com/mona_lisa.jpg"],
        ["Actores", "Brad Pitt", "https://example.com/brad_pitt.jpg"],
        ["Cantantes", "Adele", "https://example.com/adele.jpg"],
        ["Películas", "Titanic", "https://example.com/titanic.jpg"]
    ])("should fetch %s questions from Wikidata", async (category, answer, image) => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        results: {
                            bindings: [
                                {
                                    answerLabel: { value: answer },
                                    image: { value: image }
                                }
                            ]
                        }
                    })
            })
        );

        fakeAnswers.getFakeAnswers.mockImplementation(() => ["Fake1", "Fake2", "Fake3"]);

        const questions = await service.fetchQuestionsFromWikidata(category);

        expect(fetch).toHaveBeenCalled();
        expect(questions).toBeInstanceOf(Array);
        expect(questions.length).toBe(1);
        expect(questions[0]).toHaveProperty("statements");
        expect(questions[0]).toHaveProperty("answer", answer);
        expect(questions[0]).toHaveProperty("image", image);
        expect(questions[0]).toHaveProperty("category", category);
        expect(questions[0].options).toContain("Fake1");
        expect(questions[0].options.length).toBe(3);
    });

    it("should return an empty array when the category is not found", async () => {
        const questions = await service.fetchQuestionsFromWikidata("UnknownCategory");
        expect(questions).toEqual([]);
    });

    it("should return a question from the database if available", async () => {
        repository.exitsQuestions.mockResolvedValue(true);
        repository.getQuestions.mockResolvedValue([
            {
                statements: "Who is this actor?",
                answer: "Brad Pitt",
                image: "https://example.com/brad_pitt.jpg",
                category: "Actores",
                options: ["Johnny Depp", "Tom Hanks", "Robert De Niro"],
                id: "q1"
            }
        ]);

        const question = await service.getQuestion("Actores");

        expect(repository.exitsQuestions).toHaveBeenCalledWith("Actores");
        expect(repository.getQuestions).toHaveBeenCalledWith("Actores", 1);
        expect(question).toBeInstanceOf(Array);
        expect(question[0]).toHaveProperty("answer", "Brad Pitt");
    });

    it("should fetch and insert questions if the category does not exist in the database", async () => {
        repository.exitsQuestions.mockResolvedValue(false);
        repository.insertQuestions.mockResolvedValue();
        repository.getQuestions.mockResolvedValue([
            {
                statements: "Who is this actor?",
                answer: "Brad Pitt",
                image: "https://example.com/brad_pitt.jpg",
                category: "Actores",
                options: ["Johnny Depp", "Tom Hanks", "Robert De Niro"],
                id: "q2"
            }
        ]);

        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        results: {
                            bindings: [
                                {
                                    answerLabel: { value: "Brad Pitt" },
                                    image: { value: "https://example.com/brad_pitt.jpg" }
                                }
                            ]
                        }
                    })
            })
        );

        fakeAnswers.getFakeAnswers.mockImplementation(() => ["Johnny Depp", "Tom Hanks", "Robert De Niro"]);

        const question = await service.getQuestion("Actores");

        expect(repository.exitsQuestions).toHaveBeenCalledWith("Actores");
        expect(fetch).toHaveBeenCalled();
        expect(repository.insertQuestions).toHaveBeenCalled();
        expect(repository.getQuestions).toHaveBeenCalledWith("Actores", 1);
        expect(question[0]).toHaveProperty("answer", "Brad Pitt");
    });

    it("should check if the user answer is correct and delete the question", async () => {
        repository.deleteQuestion.mockResolvedValue();

        const isCorrect = await service.checkCorrectAnswer("q1", "Brad Pitt", "Brad Pitt");

        expect(repository.deleteQuestion).toHaveBeenCalledWith("q1");
        expect(isCorrect).toBe(true);
    });

    it("should return false if the user answer is incorrect", async () => {
        repository.deleteQuestion.mockResolvedValue();

        const isCorrect = await service.checkCorrectAnswer("q1", "Leonardo DiCaprio", "Brad Pitt");

        expect(repository.deleteQuestion).toHaveBeenCalledWith("q1");
        expect(isCorrect).toBe(false);
    });

    it("should handle errors if Wikidata request fails", async () => {
        global.fetch = jest.fn(() => Promise.resolve({ ok: false, status: 500 }));

        const questions = await service.fetchQuestionsFromWikidata("Actores");

        expect(fetch).toHaveBeenCalled();
        expect(questions).toEqual([]);
    }, 10000);
});
