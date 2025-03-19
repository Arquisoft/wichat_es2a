const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const repository = require("../src/repositories/wikidataRepository");
const { Question } = require("../src/model/wikidataModel");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoServer.getUri());

  repository.init(mongoose, mongoUri);
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Question.deleteMany(); // Limpiar la base de datos antes de cada test
});

describe("Wikidata Repository", () => {
  it("should initialize the repository correctly", () => {
    expect(repository.mongooseInstance).toBe(mongoose);
    expect(repository.uri).toBeDefined();
  });

  it("should check that the database is active", async () => {
    await expect(repository.checkUp()).resolves.toBeUndefined();
  });

  it("should insert multiple questions into the database", async () => {
    const questions = [
      {
        statements: "Who is this actor?",
        answer: "Brad Pitt",
        image: "https://example.com/brad_pitt.jpg",
        category: "Actor",
        options: ["Brad Pitt", "Leonardo DiCaprio", "Tom Hanks", "Johnny Depp"],
        id: "q1"
      },
      {
        statements: "Who is this singer?",
        answer: "Adele",
        image: "https://example.com/adele.jpg",
        category: "Singer",
        options: ["Adele", "Beyoncé", "Rihanna", "Lady Gaga"],
        id: "q2"
      }
    ];

    await expect(repository.insertQuestions(questions)).resolves.toBeUndefined();

    const storedQuestions = await Question.find();
    expect(storedQuestions.length).toBe(2);
    expect(storedQuestions[0].category).toBe("Actor");
    expect(storedQuestions[1].answer).toBe("Adele");
    expect(storedQuestions[1].options).toContain("Beyoncé");
  });

  it("should get a random set of questions based on category", async () => {
    await Question.insertMany([
      {
        statements: "Who is this?",
        answer: "Brad Pitt",
        image: "https://example.com/brad_pitt.jpg",
        category: "Actor",
        options: ["Brad Pitt", "Leonardo DiCaprio", "Tom Hanks", "Johnny Depp"],
        id: "q3"
      },
      {
        statements: "Who is this?",
        answer: "Leonardo DiCaprio",
        image: "https://example.com/leo.jpg",
        category: "Actor",
        options: ["Brad Pitt", "Leonardo DiCaprio", "Tom Hardy", "Ryan Gosling"],
        id: "q4"
      }
    ]);

    const questions = await repository.getQuestions("Actor", 2);
    expect(questions.length).toBe(2);
    expect(questions.every(q => q.category === "Actor")).toBeTruthy();
    expect(questions[0]).toHaveProperty("statements");
    expect(questions[0]).toHaveProperty("image");
    expect(questions[0]).toHaveProperty("options");
  });

  it("should delete all questions from the database", async () => {
    await Question.insertMany([
      {
        statements: "Who is this?",
        answer: "Brad Pitt",
        image: "https://example.com/brad_pitt.jpg",
        category: "Actor",
        options: ["Brad Pitt", "Leonardo DiCaprio", "Tom Hardy", "Ryan Gosling"],
        id: "q5"
      }
    ]);

    await repository.deleteQuestions();
    const storedQuestions = await Question.find();
    expect(storedQuestions.length).toBe(0);
  });

  it("should check if there are questions in a category", async () => {
    await Question.insertMany([
      {
        statements: "Who is this?",
        answer: "Brad Pitt",
        image: "https://example.com/brad_pitt.jpg",
        category: "Actor",
        options: ["Brad Pitt", "Leonardo DiCaprio", "Tom Hardy", "Ryan Gosling"],
        id: "q6"
      }
    ]);

    const exists = await repository.exitsQuestions("Actor");
    expect(exists).toBe(true);

    const notExists = await repository.exitsQuestions("Singer");
    expect(notExists).toBe(false);
  });

  it("should delete a specific question by ID", async () => {
    const question = await Question.create({
      statements: "Who is this?",
      answer: "Brad Pitt",
      image: "https://example.com/brad_pitt.jpg",
      category: "Actor",
      options: ["Brad Pitt", "Leonardo DiCaprio", "Tom Hardy", "Ryan Gosling"],
      id: "q7"
    });

    await repository.deleteQuestion("q7");
    const deletedQuestion = await Question.findOne({ id: "q7" });
    expect(deletedQuestion).toBeNull();
  });

  it("should return 404 if trying to delete a non-existent question", async () => {
    await expect(repository.deleteQuestion("q999")).resolves.toBeUndefined();
  });

  it("should handle errors when database is disconnected", async () => {
    await mongoose.connection.close();

    await expect(repository.checkUp()).rejects.toThrow("Error connecting to MongoDB");

    // Reconnect for the remaining tests
    await mongoose.connect(mongoServer.getUri(), { useNewUrlParser: true, useUnifiedTopology: true });
  });
});
