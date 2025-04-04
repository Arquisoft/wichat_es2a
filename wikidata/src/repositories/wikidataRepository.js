const { Question } = require("../model/wikidataModel");
const mongoose = require("mongoose");

const mongoUri = process.env.MONGODB_URI || "mongodb://mongodb-wichat_es2a:27017/wikidatadb";

const repository = {
  mongooseInstance: mongoose,
  uri: mongoUri,
  collectionName: "questions",
  Question,

  /**
   * Initialize the repository with the provided mongoose instance and URI.
   * @param {Object} mongooseInstance - The mongoose instance to use.
   * @param {String} uri - The URI of the MongoDB database. 
   */
  init: function (mongooseInstance, uri) {
    module.exports.mongooseInstance = mongooseInstance;
    module.exports.uri = uri;
  },

 /**
  * Check if the database connection is active.
  * @throws {Error} Throws an error if the database connection is not active.
  * @returns {Promise<void>} A promise that resolves when the database connection is active.
  */
 checkUp: async function () {
    if (!module.exports.mongooseInstance || !module.exports.uri) {
      throw new Error("Error: mongoose or uri is not initialized. Call `init()` first.");
    }
    if (module.exports.mongooseInstance.connection.readyState !== 1) {
      try {
        console.log("Attempting to connect to MongoDB...");
        await module.exports.mongooseInstance.connect(module.exports.uri);
      } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        throw new Error(`Error connecting to MongoDB: ${error.message}`);
      }
    }
  },

  /**
   * Get all questions from the database.
   * @returns {Promise<Array<Question>>} A promise that resolves to an array of all questions in the database.
   */
  getAllQuestions: async function () {
    try {
      await module.exports.checkUp();
      let questions = await Question.find({});
      return questions;
    } catch (error) {
      throw new Error(`Error getting all questions: ${error.message}`);
    }
  },

 /**
  * Inserts multiple questions into the database.
  *
  * This function first ensures that the database connection and necessary services are active by calling `checkUp()`.
  * Then, it uses the `insertMany` method of the `Question` model to insert the provided array of questions.
  *
  * @async
  * @param {Array<Question>} questions - An array of question objects to be inserted.
  * @throws {Error} Throws an error if the database connection check fails or if there is an error during the insertion process.
  * @returns {Promise<void>} A promise that resolves when the insertion is complete.
  */
  insertQuestions: async function (questions) {
    try {
      await module.exports.checkUp();
      await Question.insertMany(questions);
    } catch (error) {
      throw new Error(`Error inserting questions: ${error.message}`);
    }
  },

  /**
   * Get a random set of questions from the database based on the specified category.
   * @param {String} category - Question category
   * @param {int} n - Number of questions to retrieve
   * @throws {Error} Throws an error if the database connection check fails or if there is an error during the retrieval process.
   * @returns A random set of questions from the database based on the specified category
   */
  getQuestions: async function (category, n = 10) {
    try {
      await module.exports.checkUp();
      let result = await Question.aggregate([
        { $match: { category: category } },
        { $sample: { size: parseInt(n) } }
      ]);
      return result;
    } catch (error) {
      throw new Error(`Error getting questions: ${error.message}`);
    }
  },

  /**
   * Get all questions from the database based on the specified category.
   * @param {String} category - Question category
   * @throws {Error} Throws an error if the database connection check fails or if there is an error during the retrieval process.
   * @returns {Promise<Array<Question>>} A promise that resolves to an array of questions from the specified category.
   */
  getAllQuestionsFromCategory: async function (category) {
    try {
      await module.exports.checkUp();
      let questions = await Question.find({ category: category });
      return questions;
    } catch (error) {
      throw new Error(`Error getting all questions from category ${category}: ${error.message}`);
    }
  },

  /**
   * Delete all questions from the database.
   * @throws {Error} Throws an error if the database connection check fails or if there is an error during the deletion process.
   */
  deleteQuestions: async function () {
    try {
      await module.exports.checkUp();
      await Question.deleteMany({});
    } catch (error) {
      throw new Error(`Error deleting questions:${error.message}`);
    }
  },

  /**
   * Check if there are questions in the database for the specified category.
   * @param {String} category - Question category
   * @returns {Promise<boolean>} A promise that resolves to true if there are questions in the database, and false otherwise.
   * @throws {Error} Throws an error if the database connection check fails or if there is an error during the check process.
   */
  existsQuestions: async function (category) {
    try {
      await module.exports.checkUp();
      let count = await Question.countDocuments({ category: category });
      return count > 0;
    } catch (error) {
      throw new Error(`Error checking questions: ${error.message}`);
    }
  },  

  /**
   * Delete a question from the database based on the question id.
   * @param {String} id - The id of the question to delete
   * @throws {Error} Throws an error if the database connection check fails or if there is an error during the deletion process.
   */
  deleteQuestion: async function (id) {
    try {
      await module.exports.checkUp();
      await Question.deleteOne({ _id: id });
      console.log(`Question with id ${id} deleted successfully`);
    } catch (error) {
      throw new Error(`Error deleting question: ${error.message}`);
    }
  }
};

repository.init(mongoose, mongoUri);

module.exports = repository;
