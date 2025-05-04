const express = require('express');
const app = express();
app.disable('x-powered-by');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
const Group = require('./group-model');
const GroupMessage = require('./group-message-model');

app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
const apiEndpoint = process.env.GATEWAY_URL || 'http://localhost:8000';

mongoose.connect(mongoUri);

const PORT = 8004;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server listening in port http://localhost:${PORT}`);
    });
}

module.exports = app;

function validateRequiredFields(req, requiredFields) {
    for (const field of requiredFields) {
      if (!(field in req.body)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
}

app.post('/createGroup', async (req, res) => {
    try {
        validateRequiredFields(req, ['groupName', 'userId']);

        let { groupName, userId } = req.body;
        if (typeof groupName !== 'string' || groupName.length === 0 || groupName.length > 20) {
            return res.status(400).json({ error: 'El nombre del grupo no puede superar los 20 caracteres.' });
        }
        groupName = groupName.trim();

        const existingGroup = await Group.findOne({ groupName });
        if (existingGroup) {
            return res.status(400).json({ error: 'Ya existe un grupo con ese nombre' });
        }

        const newGroup = new Group({
            groupName,
            memberCount: 1,
            createdAt: new Date(),
            users: [{ user: userId, role: 'admin' }]
        });

        await newGroup.save();

        res.json(newGroup);
    } catch (error) {
        console.error("Error creating group:", error);
        res.status(400).json({ error: error.message });
    }
});

app.post('/addUserToGroup', async (req, res) => {
  try {
    validateRequiredFields(req, ['groupName', 'userId']);

    let { groupName, userId } = req.body;
    if (typeof groupName !== 'string' || groupName.length === 0 || groupName.length > 50) {
      return res.status(400).json({ error: 'Invalid groupName' });
    }
    groupName = groupName.trim();

    const group = await Group.findOne({ groupName });
    if (!group) {
        return res.status(404).json({ error: 'No existe un grupo con ese nombre' });
    }

    if (group.users.some(member => member.user.toString() === userId)) {
        return res.status(400).json({ error: 'Ya eres miembro de este grupo' });
    }

    group.memberCount += 1;
    group.users.push({ user: userId, role: 'member' });
    await group.save();

    res.json({ message: 'Te has unido al grupo correctamente', group });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/listGroupUsers', async (req, res) => {
    try {
        let { groupName } = req.query;

        if (!groupName) {
            return res.status(400).json({ error: 'Group name is required' });
        }
        if (typeof groupName !== 'string' || groupName.length === 0 || groupName.length > 50) {
            return res.status(400).json({ error: 'Invalid groupName' });
        }
        groupName = groupName.trim();

        const group = await Group.findOne({ groupName });
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        console.log('Group users:', group.users);

        const users = await Promise.all(
            group.users.map(async (member) => {
                try {
                    const userId = member.user.toString(); 
                    console.log('Fetching username for userId:', userId); 

                    const response = await axios.get(`${apiEndpoint}/getUsername`, {
                        params: { userId },
                    });

                    console.log('Username response:', response.data); 

                    return {
                        userId: member.user,
                        username: response.data.username,
                        role: member.role,
                    };
                } catch (error) {
                    console.error(`Error fetching username for userId ${member.user}:`, error);
                    return {
                        userId: member.user,
                        username: 'Unknown',
                        role: member.role,
                    };
                }
            })
        );

        res.json({ groupName: group.groupName, users });
    } catch (error) {
        console.error("Error fetching group users:", error);
        res.status(400).json({ error: error.message });
    }
});

app.get('/listGroups', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }

        if (typeof userId !== 'string' || userId.length !== 24 || !/^[a-fA-F0-9]{24}$/.test(userId)) {
            return res.status(400).json({ error: 'Invalid userId' });
        }

        const groups = await Group.find({
            'users.user': userId
        });

        if (!groups || groups.length === 0) {
            return res.json([]);
        }

        const statistics = groups.map(group => ({
            _id: group._id, 
            groupName: group.groupName,
            memberCount: group.memberCount,
            createdAt: group.createdAt,
            role: group.users.find(u => u.user.toString() === userId)?.role || 'member'
        }));

        res.json(statistics);
    } catch (error) {
        console.error("Error al obtener los grupos:", error);
        res.json([]); 
    }
});

app.post('/group/sendMessage', async (req, res) => {
    try {
        validateRequiredFields(req, ['groupName', 'username', 'message']);
        let { groupName, username, message } = req.body;

        if (typeof groupName !== 'string' || groupName.length === 0 || groupName.length > 50) {
            return res.status(400).json({ error: 'Invalid groupName' });
        }
        groupName = groupName.trim();

        const group = await Group.findOne({ groupName });

        if (!group) {
            return res.status(404).json({ error: 'No existe un grupo con ese nombre' });
        }

        const memberUsernames = await Promise.all(
            group.users.map(async (member) => {
                try {
                    const userId = member.user.toString();
                    const response = await axios.get(`${apiEndpoint}/getUsername`, { params: { userId } });
                    return response.data.username;
                } catch {
                    return null;
                }
            })
        );

        const newMessage = new GroupMessage({ groupName, username, message });
        await newMessage.save();
        res.json(newMessage);
    } catch (error) {
        console.error('Error enviando mensaje grupal:', error);
        res.status(400).json({ error: error.message });
    }
});

app.get('/group/messages', async (req, res) => {
    try {
        let { groupName } = req.query;
        if (typeof groupName !== 'string' || groupName.length === 0 || groupName.length > 50) {
            return res.status(400).json({ error: 'Invalid groupName' });
        }
        groupName = groupName.trim();
        const messages = await GroupMessage.find({ groupName: groupName }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        console.error('Error obteniendo mensajes grupales:', error);
        res.status(400).json({ error: error.message });
    }
});



