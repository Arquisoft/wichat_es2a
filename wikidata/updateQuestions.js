const mongoose = require("mongoose");
const { fetchQuestionsFromWikidata } = require("./services/wikidataService");
const { insertQuestions, init, deleteQuestions } = require("./repositories/wikidataRepository");

async function updateQuestions() {
    try {
        init(mongoose, "mongodb://mongodb-wichat_es2a:27017/wikidatadb");

        console.log("Deleting old questions...");
        await deleteQuestions();

        console.log("Getting new questions from Wikidata...");
        const questions = await fetchQuestionsFromWikidata();

        console.log(`Inserting ${questions.length} questions in MongoDB...`);
        await insertQuestions(questions);

        console.log("Database updated with new questions.");
        process.exit();
    } catch (error) {
        console.error("Error updating questions:", error);
        process.exit(1);
    }
}

updateQuestions();
