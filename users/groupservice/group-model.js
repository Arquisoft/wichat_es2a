const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    groupName: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        trim: true
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