// group-service.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Group = require('./group-model')
const User = require('./user-model');

const app = express();
const port = 8004;

// Middleware to parse JSON in request body
app.use(express.json());

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
mongoose.connect(mongoUri);



// Function to validate required fields in the request body
function validateRequiredFields(req, requiredFields) {
    for (const field of requiredFields) {
      if (!(field in req.body)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
}

app.post('/addUserToGroup', async (req, res) => {
  try {
    validateRequiredFields(req, ['username', 'groupName']);

    const { username, groupName } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const group = await Group.findOne({ name: groupName });
    if (!group) {
        return res.status(404).json({ error: 'Group not found' });
    }

    if (group.users.some(member => member.user._id === user._id)) {
        return res.status(400).json({ error: 'User is already in the group' });
    }

    group.users.push({ user: user._id, role: 'member' });
    await group.save();

    res.json({ message: 'User added to group successfully', group });
} catch (error) {
    res.status(400).json({ error: error.message });
}
});


const server = app.listen(port, () => {
  console.log(`Group Service listening at http://localhost:${port}`);
});

// Listen for the 'close' event on the Express.js server
server.on('close', () => {
    // Close the Mongoose connection
    mongoose.connection.close();
  });

module.exports = server