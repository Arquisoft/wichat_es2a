const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now, 
    },
    friends: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
      default:[],
    },
    friendRequests: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    avatarOptions: {
      hair: String,
      eyes: String,
      mouth: String,
      hairColor: String,
      skinColor: String
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User