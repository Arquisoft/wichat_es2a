FROM node:22

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Expose the port the service runs on
EXPOSE 3002

# Start the service
CMD ["npm", "start"]

USER node
