FROM node:22

COPY . /app
WORKDIR /app

#Install the dependencies
RUN npm install

ARG GATEWAY_URL="http://localhost:8000"
ENV REACT_APP_GATEWAY_URL=$GATEWAY_URL

#Create an optimized version of the webapp
RUN npm run build
RUN npm install serve

#Execute npm run prod to run the server
CMD [ "npm", "run", "prod" ]
#CMD ["npm", "start"]