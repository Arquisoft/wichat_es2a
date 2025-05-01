const request = require('supertest');
const axios = require('axios');
const server = require('./gateway-service'); 
const fs = require('fs');
const crypto = require('crypto');

jest.mock('axios');

afterAll(() => {
  server.close(); 
});

describe('Gateway API - First 5 endpoints', () => {
  test('GET /health should return status OK', async () => {
    const res = await request(server).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'OK' });
  });

  test('POST /login should return auth data on success', async () => {
    const mockData = { token: 'abc123' };
    axios.post.mockResolvedValueOnce({ data: mockData });

    let psw = crypto.randomBytes(1).toString('hex');

    const res = await request(server).post('/login').send({ username: 'test', password: psw });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockData);
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/login'), { username: 'test', password: psw });
  });

  test('POST /login should handle auth error', async () => {
    axios.post.mockRejectedValueOnce({
      response: { status: 401, data: { error: 'Unauthorized' } }
    });

    let psw = crypto.randomBytes(1);

    const res = await request(server).post('/login').send({ username: 'fail', password: psw });

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized' });
  });

  test('POST /adduser should return user creation data', async () => {
    const mockData = { success: true };
    axios.post.mockResolvedValueOnce({ data: mockData });

    const res = await request(server).post('/adduser').send({ name: 'John Doe' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockData);
  });

  test('POST /adduser should handle user creation error', async () => {
    axios.post.mockRejectedValueOnce({
      response: { status: 400, data: { error: 'Bad Request' } }
    });

    const res = await request(server).post('/adduser').send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Bad Request' });
  });

  test('POST /askllm should return LLM answer', async () => {
    const mockData = { answer: '42' };
    axios.post.mockResolvedValueOnce({ data: mockData });

    const res = await request(server).post('/askllm').send({
      question: 'What is the answer?',
      category: 'general',
      answer: '',
      language: 'en'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockData);
  });

  test('POST /askllm should handle LLM error', async () => {
    axios.post.mockRejectedValueOnce({
      response: { status: 500, data: { error: 'LLM failed' } }
    });

    const res = await request(server).post('/askllm').send({
      question: 'Fail test',
      category: '',
      answer: '',
      language: 'en'
    });

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'LLM failed' });
  });

  test('GET /conversations/:userId should return history', async () => {
    const mockData = { history: ['msg1', 'msg2'] };
    axios.get.mockResolvedValueOnce({ data: mockData });

    const res = await request(server).get('/conversations/user123');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockData);
  });

  test('GET /conversations/:userId should handle error', async () => {
    axios.get.mockRejectedValueOnce({
      response: { status: 404, data: { error: 'Not found' } }
    });

    const res = await request(server).get('/conversations/unknownUser');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });
});

describe('Gateway API - Endpoints 6 al 10', () => {
  test('DELETE /conversations/:userId should clear conversation', async () => {
    const mockData = { cleared: true };
    axios.delete.mockResolvedValueOnce({ data: mockData });

    const res = await request(server).delete('/conversations/user123?preservePrePrompt=true');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockData);
    expect(axios.delete).toHaveBeenCalledWith(
      expect.stringContaining('/conversations/user123'),
      { params: { preservePrePrompt: 'true' } }
    );
  });

  test('DELETE /conversations/:userId should handle error', async () => {
    axios.delete.mockRejectedValueOnce({
      response: { status: 500, data: { error: 'Internal Error' } }
    });

    const res = await request(server).delete('/conversations/failuser');

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Internal Error' });
  });

  test('PUT /conversations/:userId/settings should update settings', async () => {
    const mockData = { updated: true };
    axios.put.mockResolvedValueOnce({ data: mockData });

    const res = await request(server).put('/conversations/user123/settings').send({ setting: 'value' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockData);
  });

  test('PUT /conversations/:userId/settings should handle error', async () => {
    axios.put.mockRejectedValueOnce({
      response: { status: 400, data: { error: 'Invalid settings' } }
    });

    const res = await request(server).put('/conversations/user123/settings').send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid settings' });
  });

  test('GET /wikidata/question/:category/:number should return question', async () => {
    const mockData = { question: 'What is AI?' };
    axios.get.mockResolvedValueOnce({ data: mockData });

    const res = await request(server).get('/wikidata/question/science/1');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockData);
  });

  test('GET /wikidata/question/:category/:number should handle error', async () => {
    axios.get.mockRejectedValueOnce({
      response: { status: 500, data: { error: 'Service unavailable' } }
    });

    const res = await request(server).get('/wikidata/question/fail/1');

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Service unavailable' });
  });

  test('POST /wikidata/verify should return verification result', async () => {
    const mockData = { verified: true };
    axios.post.mockResolvedValueOnce({ data: mockData });

    const res = await request(server).post('/wikidata/verify').send({ answer: '42' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockData);
  });

  test('POST /wikidata/verify should handle error', async () => {
    axios.post.mockRejectedValueOnce({
      response: { status: 400, data: { error: 'Invalid answer' } }
    });

    const res = await request(server).post('/wikidata/verify').send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid answer' });
  });

  test('GET /wikidata/clear should clear questions', async () => {
    const mockData = { cleared: true };
    axios.get.mockResolvedValueOnce({ data: mockData });

    const res = await request(server).get('/wikidata/clear');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockData);
  });

  test('GET /wikidata/clear should handle error', async () => {
    axios.get.mockRejectedValueOnce({
      response: { status: 500, data: { error: 'Could not clear' } }
    });

    const res = await request(server).get('/wikidata/clear');

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Could not clear' });
  });
});

describe('Gateway API - Endpoints 11 al 15', () => {
  test('POST /game/start should start the game', async () => {
    const mockData = { started: true };
    axios.post.mockResolvedValueOnce({ data: mockData });

    const res = await request(server).post('/game/start').send({ userId: 'user1' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockData);
  });

  test('POST /game/start should handle error', async () => {
    axios.post.mockRejectedValueOnce({
      response: { status: 400, data: { error: 'Invalid request' } }
    });

    const res = await request(server).post('/game/start').send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid request' });
  });

  test('POST /game/end should end the game', async () => {
    const mockData = { ended: true };
    axios.post.mockResolvedValueOnce({ data: mockData });

    const res = await request(server).post('/game/end').send({ userId: 'user1' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockData);
  });

  test('POST /game/end should handle error', async () => {
    axios.post.mockRejectedValueOnce({
      response: { status: 500, data: { error: 'Game not found' } }
    });

    const res = await request(server).post('/game/end').send({});

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Game not found' });
  });

  test('GET /game/statistics should return stats', async () => {
    const mockData = { stats: { wins: 10 } };
    axios.get.mockResolvedValueOnce({ data: mockData });

    const res = await request(server).get('/game/statistics').query({ userId: 'user1' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockData);
  });

  test('GET /game/statistics should handle error', async () => {
    axios.get.mockRejectedValueOnce({
      response: { status: 404, data: { error: 'Stats not found' } }
    });

    const res = await request(server).get('/game/statistics').query({});

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Stats not found' });
  });

  test('GET /group/listGroups should return groups', async () => {
    const mockData = { groups: ['group1', 'group2'] };
    axios.get.mockResolvedValueOnce({ data: mockData });

    const res = await request(server).get('/group/listGroups').query({ userId: 'user1' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockData);
  });

  test('GET /group/listGroups should handle error', async () => {
    axios.get.mockRejectedValueOnce({
      response: { status: 500, data: { error: 'Could not fetch groups' } }
    });

    const res = await request(server).get('/group/listGroups');

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Could not fetch groups' });
  });

  test('POST /group/createGroup should create group', async () => {
    const mockData = { success: true };
    axios.post.mockResolvedValueOnce({ data: mockData });

    const res = await request(server).post('/group/createGroup').send({ name: 'Test Group' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockData);
  });

  test('POST /group/createGroup should handle error', async () => {
    axios.post.mockRejectedValueOnce({
      response: { status: 400, data: { error: 'Invalid group' } }
    });

    const res = await request(server).post('/group/createGroup').send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid group' });
  });
});

describe('Gateway API - Endpoints 16 al 20', () => {
  test('POST /group/addUserToGroup should add user to group', async () => {
    const mockData = { added: true };
    axios.post.mockResolvedValueOnce({ data: mockData });

    const res = await request(server).post('/group/addUserToGroup').send({ groupId: 'g1', userId: 'u1' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockData);
  });

  test('POST /group/addUserToGroup should handle error', async () => {
    axios.post.mockRejectedValueOnce({
      response: { status: 400, data: { error: 'Missing data' } }
    });

    const res = await request(server).post('/group/addUserToGroup').send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Missing data' });
  });

  test('GET /group/listGroupUsers should return users', async () => {
    const mockData = { users: ['user1', 'user2'] };
    axios.get.mockResolvedValueOnce({ data: mockData });

    const res = await request(server).get('/group/listGroupUsers').query({ groupId: 'g1' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockData);
  });

  test('GET /group/listGroupUsers should handle error', async () => {
    axios.get.mockRejectedValueOnce({
      response: { status: 404, data: { error: 'Group not found' } }
    });

    const res = await request(server).get('/group/listGroupUsers').query({ groupId: 'invalid' });

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Group not found' });
  });

  test('GET /getUserId should return user ID', async () => {
    const mockData = { id: 'u123' };
    axios.get.mockResolvedValueOnce({ data: mockData });

    const res = await request(server).get('/getUserId').query({ username: 'testuser' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockData);
  });

  test('GET /getUserId should handle error', async () => {
    axios.get.mockRejectedValueOnce({
      response: { status: 500, data: { error: 'Failed to retrieve ID' } }
    });

    const res = await request(server).get('/getUserId');

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to retrieve ID' });
  });

  test('GET /getUsername should return username', async () => {
    const mockData = { username: 'testuser' };
    axios.get.mockResolvedValueOnce({ data: mockData });

    const res = await request(server).get('/getUsername').query({ id: 'u123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockData);
  });

  test('GET /getUsername should handle error', async () => {
    axios.get.mockRejectedValueOnce({
      response: { status: 404, data: { error: 'User not found' } }
    });

    const res = await request(server).get('/getUsername');

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'User not found' });
  });

  test('GET /users/:id should return user data', async () => {
    const mockData = { name: 'John Doe' };
    axios.get.mockResolvedValueOnce({ data: mockData });

    const res = await request(server).get('/users/u123');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockData);
  });

  test('GET /users/:id should handle error', async () => {
    axios.get.mockRejectedValueOnce({
      response: { status: 404, data: { error: 'User not found' } }
    });

    const res = await request(server).get('/users/invalid');

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'User not found' });
  });
});

describe('Gateway API - Endpoints 21 al 25', () => {
  test('PUT /users/:id should update user', async () => {
    const mockData = { updated: true };
    axios.put.mockResolvedValueOnce({ data: mockData });

    const res = await request(server).put('/users/u123').send({ name: 'New Name' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockData);
  });

  test('PUT /users/:id should handle error', async () => {
    axios.put.mockRejectedValueOnce({
      response: { status: 400, data: { error: 'Update failed' } }
    });

    const res = await request(server).put('/users/u123').send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Update failed' });
  });

  test('POST /group/sendMessage should send message', async () => {
    const mockData = { sent: true };
    axios.post.mockResolvedValueOnce({ data: mockData });

    const res = await request(server).post('/group/sendMessage').send({ groupId: 'g1', message: 'Hi' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockData);
  });

  test('POST /group/sendMessage should handle error', async () => {
    axios.post.mockRejectedValueOnce({
      response: { status: 500, data: { error: 'Failed to send' } }
    });

    const res = await request(server).post('/group/sendMessage').send({});

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to send' });
  });

  test('GET /group/messages should return messages', async () => {
    const mockData = { messages: ['msg1', 'msg2'] };
    axios.get.mockResolvedValueOnce({ data: mockData });

    const res = await request(server).get('/group/messages').query({ groupId: 'g1' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockData);
  });

  test('GET /group/messages should handle error', async () => {
    axios.get.mockRejectedValueOnce({
      response: { status: 500, data: { error: 'Failed to get messages' } }
    });

    const res = await request(server).get('/group/messages');

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to get messages' });
  });

  test('GET /mathgame/question with base param should return question', async () => {
    const mockData = { question: '2+2' };
    axios.get.mockResolvedValueOnce({ data: mockData });

    const res = await request(server).get('/mathgame/question/10');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockData);
  });

  test('GET /mathgame/question without base param should return question', async () => {
    const mockData = { question: '3+5' };
    axios.get.mockResolvedValueOnce({ data: mockData });

    const res = await request(server).get('/mathgame/question');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockData);
  });

  test('GET /mathgame/question should handle error', async () => {
    axios.get.mockRejectedValueOnce({
      response: { status: 500, data: { error: 'Error fetching math question' } }
    });

    const res = await request(server).get('/mathgame/question');

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Error fetching math question' });
  });

  test('POST /mathgame/verify should return result', async () => {
    const mockData = { correct: true };
    axios.post.mockResolvedValueOnce({ data: mockData });

    const res = await request(server).post('/mathgame/verify').send({ answer: 4 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockData);
  });

  test('POST /mathgame/verify should handle error', async () => {
    axios.post.mockRejectedValueOnce({
      response: { status: 400, data: { error: 'Invalid answer' } }
    });

    const res = await request(server).post('/mathgame/verify').send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid answer' });
  });
});

