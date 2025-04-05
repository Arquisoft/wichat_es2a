@echo off

start cmd /k "cd gatewayservice && npm install && npm start"
start cmd /k "cd llmservice && npm install && npm start"
start cmd /k "cd users\userservice && npm install && npm start"
start cmd /k "cd users\authservice && npm install && npm start"
start cmd /k "cd webapp && npm install && npm start"
start cmd /k "cd wikidata && npm install && npm start"
start cmd /k "cd apiservice && npm install && npm start"