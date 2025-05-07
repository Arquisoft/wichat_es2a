const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoserver;
let userservice;
let authservice;
let llmservice;
let gatewayservice;
let wikidataservice;
let groupservice;

async function startServer() {
    console.log('Starting MongoDB memory server...');
    mongoserver = await MongoMemoryServer.create();
    const mongoUri = mongoserver.getUri();
    process.env.MONGODB_URI = mongoUri;
    userservice = await require("../../users/userservice/user-service");
    authservice = await require("../../users/authservice/auth-service");
    llmservice = await require("../../llmservice/llm-service");
    gatewayservice = await require("../../gatewayservice/gateway-service");
    const wikidataApp = require("../../wikidata/src/wikidataRoutes");
    const wikidataServer = wikidataApp.listen(3001, () => {
        console.log("📚 Wikidata Service listening at http://localhost:3001");
    });
    process.env.WIKIDATA_PORT = 3001;

    groupservice = await require("../../users/groupservice/group-service");
}

startServer();
