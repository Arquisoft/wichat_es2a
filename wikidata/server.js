const express = require('express');
const mongoose = require('mongoose');
const apiRoutes = require('./api');
const { fetchQuestionsFromWikidata } = require('./services/wikidataService');
const { init, deleteQuestions, insertQuestions } = require('./repositories/wikidataRepository');

const app = express();
app.use(express.json());
app.use('/wikidata/api.js', apiRoutes);

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://mongodb-wichat_es2a:27017/wikidatadb";

async function updateQuestions() {
    try {
        await init(mongoose, MONGODB_URI);

        console.log("Deleting old questions...");
        await deleteQuestions();

        console.log("Getting new questions...");
        const questions = await fetchQuestionsFromWikidata();

        console.log("Inserting new questions...");
        await insertQuestions(questions);

        console.log("Questions updated successfully.");
    } catch (error) {
        console.error("Error updating questions:", error);
    }
}

async function startServer() {
    await mongoose.connect(MONGODB_URI);
    await updateQuestions();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer();
