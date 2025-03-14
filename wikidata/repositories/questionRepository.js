const {Question} = require("../model/wikidataModel");
const { fetchQuestionsFromWikidata } = require("../service/wikidataService.js");

module.exports = {
  mongoose: null,
  uri: null,
  collectionName: "questions",
  Question,

  init: function (mongoose, uri) {
    this.mongoose = mongoose;
    this.uri = uri;
  },

  checkUp: async function () {
    if (this.mongoose.connection.readyState !== 1) {
      try {
        await this.mongoose.connect(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });
      } catch (error) {
        console.error("Error conectando a MongoDB:", error);
      }
    }
  },

  updateQuestionsFromWikidata: async function () {
    try {
        await this.checkUp();
        const questions = await fetchQuestionsFromWikidata();

        if (questions.length > 0) {
            await this.mongoose.connection.collection(this.collectionName).insertMany(questions);
            console.log("Preguntas de Wikidata insertadas en la base de datos.");
        } else {
            console.log("No se encontraron nuevas preguntas para insertar.");
        }
    } catch (error) {
        console.error("Error al actualizar preguntas desde Wikidata:", error);
    }
  },

  getQuestions: async function (category, n = 10) {
    try {
      await this.checkUp();

      let result = await this.mongoose.connection
        .collection(this.collectionName)
        .aggregate([
          { $match: { categories: category } },
          { $sample: { size: parseInt(n) } },
        ])
        .toArray();

      for (const question of result) {
        question.options = await this.getDistinctOptions(question);
      }

      return result; } catch (error) { throw error.message; }
  },

  insertQuestions: async function (questions) {
    try {
      await this.checkUp();
      await this.mongoose.connection
        .collection(this.collectionName)
        .insertMany(questions); } catch (error) { throw error.message; }
  },

  deleteQuestions: async function (groupId) {
    try {
      await this.checkUp();
      await this.mongoose.connection
        .collection(this.collectionName)
        .deleteMany({ groupId }); } catch (error) { throw error.message; }
  },

  removeQuestions: async function (filter, options) {
    try {
      await this.checkUp();
      await this.mongoose.connection
        .collection(this.collectionName)
        .deleteMany(filter, options); } catch (error) { throw error.message; }
  },
};