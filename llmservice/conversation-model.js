const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['system', 'user', 'assistant'], // Added 'system' role for preprompt
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    isPrePrompt: {
        type: Boolean,
        default: false
    }
});

const conversationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    messages: [messageSchema],
    model: String,
    maxHistoryLength: {
        type: Number,
        default: 10 // Default max number of messages to keep in history
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
conversationSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Enforce maxHistoryLength limit on messages array, but preserve preprompt
conversationSchema.pre('save', function(next) {
    if (this.messages && this.messages.length > this.maxHistoryLength) {
        // Keep preprompt messages (isPrePrompt: true) and the most recent regular messages
        const prepromptMessages = this.messages.filter(msg => msg.isPrePrompt);
        const regularMessages = this.messages.filter(msg => !msg.isPrePrompt);
        
        // Only keep the most recent regular messages according to maxHistoryLength
        const recentRegularMessages = regularMessages.slice(-this.maxHistoryLength);
        
        // Combine preprompt messages with recent regular messages
        this.messages = [...prepromptMessages, ...recentRegularMessages];
    }
    next();
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;