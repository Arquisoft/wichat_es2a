const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Conversation = require('./conversation-model');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('Conversation Model', () => {
  beforeEach(async () => {
    await Conversation.deleteMany({});
  });

  it('should create a conversation successfully', async () => {
    const conversation = new Conversation({
      userId: 'testUser',
      model: 'gemini',
      messages: [{
        role: 'system',
        content: 'You are a helpful assistant',
        isPrePrompt: true
      }]
    });

    const savedConversation = await conversation.save();
    expect(savedConversation).toHaveProperty('_id');
    expect(savedConversation.userId).toBe('testUser');
    expect(savedConversation.model).toBe('gemini');
    expect(savedConversation.messages.length).toBe(1);
  });

  it('should update timestamps on save', async () => {
    const conversation = new Conversation({
      userId: 'testUser',
      model: 'gemini'
    });

    // Save initially
    await conversation.save();
    const createdAt = conversation.createdAt;
    const initialUpdatedAt = conversation.updatedAt;

    // Force delay to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Update and save again
    conversation.model = 'empathy';
    await conversation.save();

    expect(conversation.createdAt).toEqual(createdAt); // createdAt should not change
    expect(conversation.updatedAt).not.toEqual(initialUpdatedAt); // updatedAt should change
    expect(conversation.updatedAt > initialUpdatedAt).toBeTruthy();
  });

  it('should enforce maxHistoryLength while preserving preprompt', async () => {
    // Create a conversation with maxHistoryLength 3
    const conversation = new Conversation({
      userId: 'testUser',
      model: 'gemini',
      maxHistoryLength: 3,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant',
          isPrePrompt: true
        }
      ]
    });

    // Add 5 messages (exceeding maxHistoryLength)
    for (let i = 1; i <= 5; i++) {
      conversation.messages.push({
        role: i % 2 === 0 ? 'assistant' : 'user',
        content: `Message ${i}`,
        isPrePrompt: false
      });
    }

    await conversation.save();

    // After save, we should have the preprompt + 3 most recent messages
    expect(conversation.messages.length).toBe(4); // 1 preprompt + 3 recent messages
    
    // Verify preprompt is preserved
    expect(conversation.messages[0].isPrePrompt).toBe(true);
    expect(conversation.messages[0].content).toBe('You are a helpful assistant');
    
    // Verify we have the 3 most recent messages
    expect(conversation.messages[1].content).toBe('Message 3');
    expect(conversation.messages[2].content).toBe('Message 4');
    expect(conversation.messages[3].content).toBe('Message 5');
  });

  it('should require userId field', async () => {
    const conversation = new Conversation({
      model: 'gemini'
    });

    // Attempt to save without required userId
    await expect(conversation.save()).rejects.toThrow();
  });

  it('should default maxHistoryLength to 20', async () => {
    const conversation = new Conversation({
      userId: 'testUser'
    });

    await conversation.save();
    expect(conversation.maxHistoryLength).toBe(20);
  });

  it('should handle multiple preprompt messages correctly', async () => {
    const conversation = new Conversation({
      userId: 'testUser',
      maxHistoryLength: 2,
      messages: [
        {
          role: 'system',
          content: 'Preprompt 1',
          isPrePrompt: true
        },
        {
          role: 'system',
          content: 'Preprompt 2',
          isPrePrompt: true
        }
      ]
    });

    // Add 3 regular messages (exceeding maxHistoryLength)
    for (let i = 1; i <= 3; i++) {
      conversation.messages.push({
        role: 'user',
        content: `Message ${i}`
      });
    }

    await conversation.save();

    // Should have 2 preprompt + 2 most recent messages
    expect(conversation.messages.length).toBe(4);
    expect(conversation.messages[0].isPrePrompt).toBe(true);
    expect(conversation.messages[1].isPrePrompt).toBe(true);
    expect(conversation.messages[2].content).toBe('Message 2');
    expect(conversation.messages[3].content).toBe('Message 3');
  });
});