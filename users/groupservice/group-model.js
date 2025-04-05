const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    groupName: {
        type: String,
        required: true,
        unique: true
    },
    memberCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    users: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: {
            type: String,
            enum: ["admin", "member"],
            default: "member"
        }
    }]
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;