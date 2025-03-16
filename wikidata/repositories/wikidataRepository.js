const { Question } = require("../model/wikidataModel");
const mongoose = require("mongoose");

const mongoUri = process.env.MONGODB_URI || "mongodb://mongodb-wichat_es2a:27017/wikidatadb";

const repository = {
  mongooseInstance: mongoose,
  uri: mongoUri,
  collectionName: "questions",
  Question,

  init: function (mongooseInstance, uri) {
    module.exports.mongooseInstance = mongooseInstance;
    module.exports.uri = uri;
  },

  checkUp: async function () {
    if (!module.exports.mongooseInstance || !module.exports.uri) {
      throw new Error("Error: mongoose or uri is not initialized. Call `init()` first.");
    }
    if (module.exports.mongooseInstance.connection.readyState !== 1) {
      try {
        await module.exports.mongooseInstance.connect(module.exports.uri, { useNewUrlParser: true, useUnifiedTopology: true });
      } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
      }
    }
  },

  insertQuestions: async function (questions) {
    try {
      await module.exports.checkUp();
      await Question.insertMany(questions);
    } catch (error) {
      throw new Error(`Error inserting questions: ${error.message}`);
    }
  },

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

  deleteQuestions: async function () {
    try {
      await module.exports.checkUp();
      await Question.deleteMany({});
    } catch (error) {
      throw new Error(`Error deleting questions:${error.message}`);
    }
  }
};

repository.init(mongoose, mongoUri);

module.exports = repository;
