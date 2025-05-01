const mongoose = require('mongoose');

const privateMessageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const PrivateMessage = mongoose.model('PrivateMessage', privateMessageSchema);
module.exports = PrivateMessage;