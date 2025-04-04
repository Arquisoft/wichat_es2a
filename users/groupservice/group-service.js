// group-service.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const axios = require('axios');
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

app.post('/createGroup', async (req, res) => {
  try {
      validateRequiredFields(req, ['groupName', 'username']);

      const { groupName, username } = req.body;

      const user = await User.findOne({ username });
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      const existingGroup = await Group.findOne({ name: groupName });
      if (existingGroup) {
          return res.status(400).json({ error: 'Group name already taken' });
      }

      const newGroup = new Group({
          name: groupName,
          users: [{ user: user._id, role: 'admin' }]
      });

      await newGroup.save();

      res.json(newGroup);
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
});

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

app.get('/getGroupUsers', async (req, res) => {
    try {
        const { groupName } = req.query;

        if (!groupName) {
            return res.status(400).json({ error: 'Group name is required' });
        }

        const group = await Group.findOne({ name: groupName }).populate('users.user', 'username');
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const users = group.users.map(member => ({
            username: member.user.username,
            role: member.role,
            gameHistoryLink: `/game/statistics?userId=${member.user._id}` // Enlace para consultar el historial de partidas
        }));

        res.json({ groupName: group.name, users });
    } catch (error) {
        console.error("Error fetching group users:", error);
        res.status(400).json({ error: error.message });
    }
});

app.get('/listGroupUsers', async (req, res) => {
    try {
        const { groupName } = req.query;

        if (!groupName) {
            return res.status(400).json({ error: 'Group name is required' });
        }

        const group = await Group.findOne({ name: groupName }).populate('users.user', 'username');
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const users = group.users.map(member => ({
            username: member.user.username,
            role: member.role
        }));

        res.json({ groupName: group.name, users });
    } catch (error) {
        console.error("Error fetching group users:", error);
        res.status(400).json({ error: error.message });
    }
});

app.get('/getUserGameHistory', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const response = await axios.get(`http://localhost:3001/game/statistics`, { params: { userId } });
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching user game history:", error);
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