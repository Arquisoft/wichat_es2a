const mongoose = require('mongoose');

const groupMessageSchema = new mongoose.Schema({
    groupName: { type: String, required: true },
    username: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const GroupMessage = mongoose.model('GroupMessage', groupMessageSchema);

module.exports = GroupMessage;
