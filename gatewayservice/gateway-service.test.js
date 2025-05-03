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

  describe('POST /login', () => {
    test.each([
      [200, { token: 'abc123' }, { username: 'test', password: 'psw' }, undefined],
      [401, { error: 'Unauthorized' }, { username: 'fail', password: 'psw' }, { response: { status: 401, data: { error: 'Unauthorized' } } }],
      [500, { error: 'Internal error' }, { username: 'fail', password: 'psw' }, new Error('fail')],
    ])('should handle status %i', async (status, expected, body, error) => {
      if (error) {
        axios.post.mockRejectedValueOnce(error);
      } else {
        axios.post.mockResolvedValueOnce({ data: expected });
      }
      const res = await request(server).post('/login').send(body);
      expect(res.statusCode).toBe(status === 500 ? 500 : status);
      expect(res.body).toEqual(expected);
    });
  });

  describe('POST /adduser', () => {
    test.each([
      [200, { success: true }, { name: 'John Doe' }, undefined],
      [400, { error: 'Bad Request' }, {}, { response: { status: 400, data: { error: 'Bad Request' } } }],
      [500, { error: 'Internal error' }, { name: 'fail' }, new Error('fail')],
    ])('should handle status %i', async (status, expected, body, error) => {
      if (error) {
        axios.post.mockRejectedValueOnce(error);
      } else {
        axios.post.mockResolvedValueOnce({ data: expected });
      }
      const res = await request(server).post('/adduser').send(body);
      expect(res.statusCode).toBe(status === 500 ? 500 : status);
      expect(res.body).toEqual(expected);
    });
  });

  describe('POST /askllm', () => {
    test.each([
      [200, { answer: '42' }, { question: 'What is the answer?', category: 'general', answer: '', language: 'en' }, undefined],
      [500, { error: 'LLM failed' }, { question: 'Fail test', category: '', answer: '', language: 'en' }, { response: { status: 500, data: { error: 'LLM failed' } } }],
      [500, { error: 'An error occurred while communicating with the LLM service' }, { question: 'fail', category: '', answer: '', language: 'en' }, new Error('fail')],
    ])('should handle status %i', async (status, expected, body, error) => {
      if (error) {
        axios.post.mockRejectedValueOnce(error);
      } else {
        axios.post.mockResolvedValueOnce({ data: expected });
      }
      const res = await request(server).post('/askllm').send(body);
      expect(res.statusCode).toBe(status);
      expect(res.body).toEqual(expected);
    });
  });

  describe('GET /conversations/:userId', () => {
    test.each([
      [200, { history: ['msg1', 'msg2'] }, 'user123', undefined],
      [404, { error: 'Not found' }, 'unknownUser', { response: { status: 404, data: { error: 'Not found' } } }],
      [500, { error: 'An error occurred while retrieving conversation history' }, 'fail', new Error('fail')],
    ])('should handle status %i', async (status, expected, userId, error) => {
      if (error) {
        axios.get.mockRejectedValueOnce(error);
      } else {
        axios.get.mockResolvedValueOnce({ data: expected });
      }
      const res = await request(server).get(`/conversations/${userId}`);
      expect(res.statusCode).toBe(status);
      expect(res.body).toEqual(expected);
    });
  });
});

describe('Gateway API - Endpoints 6 al 10', () => {
  describe('DELETE /conversations/:userId', () => {
    test.each([
      [200, { cleared: true }, 'user123', { preservePrePrompt: 'true' }, undefined],
      [500, { error: 'Internal Error' }, 'failuser', {}, { response: { status: 500, data: { error: 'Internal Error' } } }],
      [500, { error: 'An error occurred while clearing conversation history' }, 'fail', {}, new Error('fail')],
    ])('should handle status %i', async (status, expected, userId, query, error) => {
      if (error) {
        axios.delete.mockRejectedValueOnce(error);
      } else {
        axios.delete.mockResolvedValueOnce({ data: expected });
      }
      const q = Object.keys(query).length ? `?preservePrePrompt=${query.preservePrePrompt}` : '';
      const res = await request(server).delete(`/conversations/${userId}${q}`);
      expect(res.statusCode).toBe(status);
      expect(res.body).toEqual(expected);
    });
  });

  describe('PUT /conversations/:userId/settings', () => {
    test.each([
      [200, { updated: true }, 'user123', { setting: 'value' }, undefined],
      [400, { error: 'Invalid settings' }, 'user123', {}, { response: { status: 400, data: { error: 'Invalid settings' } } }],
      [500, { error: 'An error occurred while updating conversation settings' }, 'fail', {}, new Error('fail')],
    ])('should handle status %i', async (status, expected, userId, body, error) => {
      if (error) {
        axios.put.mockRejectedValueOnce(error);
      } else {
        axios.put.mockResolvedValueOnce({ data: expected });
      }
      const res = await request(server).put(`/conversations/${userId}/settings`).send(body);
      expect(res.statusCode).toBe(status);
      expect(res.body).toEqual(expected);
    });
  });

  describe('GET /wikidata/question/:category/:number', () => {
    test.each([
      [200, { question: 'What is AI?' }, 'science', 1, undefined],
      [500, { error: 'Service unavailable' }, 'fail', 1, { response: { status: 500, data: { error: 'Service unavailable' } } }],
      [500, { error: 'Error getting the questions from Wikidata' }, 'fail', 2, new Error('fail')],
    ])('should handle status %i', async (status, expected, category, number, error) => {
      if (error) {
        axios.get.mockRejectedValueOnce(error);
      } else {
        axios.get.mockResolvedValueOnce({ data: expected });
      }
      const res = await request(server).get(`/wikidata/question/${category}/${number}`);
      expect(res.statusCode).toBe(status);
      expect(res.body).toEqual(expected);
    });
  });

  describe('POST /wikidata/verify', () => {
    test.each([
      [200, { verified: true }, { answer: '42' }, undefined],
      [400, { error: 'Invalid answer' }, {}, { response: { status: 400, data: { error: 'Invalid answer' } } }],
      [500, { error: 'Error verifying the answer' }, { answer: 'fail' }, new Error('fail')],
    ])('should handle status %i', async (status, expected, body, error) => {
      if (error) {
        axios.post.mockRejectedValueOnce(error);
      } else {
        axios.post.mockResolvedValueOnce({ data: expected });
      }
      const res = await request(server).post('/wikidata/verify').send(body);
      expect(res.statusCode).toBe(status);
      expect(res.body).toEqual(expected);
    });
  });
});

describe('Gateway API - Endpoints 11 al 15', () => {
  describe('POST /game/start', () => {
    test.each([
      [200, { started: true }, { userId: 'user1' }, undefined],
      [400, { error: 'Invalid request' }, {}, { response: { status: 400, data: { error: 'Invalid request' } } }],
      [500, { error: 'Error starting the game' }, { userId: 'fail' }, new Error('fail')],
    ])('should handle status %i', async (status, expected, body, error) => {
      if (error) {
        axios.post.mockRejectedValueOnce(error);
      } else {
        axios.post.mockResolvedValueOnce({ data: expected });
      }
      const res = await request(server).post('/game/start').send(body);
      expect(res.statusCode).toBe(status);
      expect(res.body).toEqual(expected);
    });
  });

  describe('POST /game/end', () => {
    test.each([
      [200, { ended: true }, { userId: 'user1' }, undefined],
      [500, { error: 'Game not found' }, {}, { response: { status: 500, data: { error: 'Game not found' } } }],
      [500, { error: 'Error ending the game' }, { userId: 'fail' }, new Error('fail')],
    ])('should handle status %i', async (status, expected, body, error) => {
      if (error) {
        axios.post.mockRejectedValueOnce(error);
      } else {
        axios.post.mockResolvedValueOnce({ data: expected });
      }
      const res = await request(server).post('/game/end').send(body);
      expect(res.statusCode).toBe(status);
      expect(res.body).toEqual(expected);
    });
  });

  describe('GET /game/statistics', () => {
    test.each([
      [200, { stats: { wins: 10 } }, { userId: 'user1' }, undefined],
      [404, { error: 'Stats not found' }, {}, { response: { status: 404, data: { error: 'Stats not found' } } }],
      [500, { error: 'Error fetching game statistics' }, { userId: 'fail' }, new Error('fail')],
    ])('should handle status %i', async (status, expected, query, error) => {
      if (error) {
        axios.get.mockRejectedValueOnce(error);
      } else {
        axios.get.mockResolvedValueOnce({ data: expected });
      }
      const res = await request(server).get('/game/statistics').query(query);
      expect(res.statusCode).toBe(status);
      expect(res.body).toEqual(expected);
    });
  });

  describe('GET /group/listGroups', () => {
    test.each([
      [200, { groups: ['group1', 'group2'] }, { userId: 'user1' }, undefined],
      [500, { error: 'Could not fetch groups' }, {}, { response: { status: 500, data: { error: 'Could not fetch groups' } } }],
      [500, { error: 'Error fetching groups' }, { userId: 'fail' }, new Error('fail')],
    ])('should handle status %i', async (status, expected, query, error) => {
      if (error) {
        axios.get.mockRejectedValueOnce(error);
      } else {
        axios.get.mockResolvedValueOnce({ data: expected });
      }
      const res = await request(server).get('/group/listGroups').query(query);
      expect(res.statusCode).toBe(status);
      expect(res.body).toEqual(expected);
    });
  });

  describe('POST /group/createGroup', () => {
    test.each([
      [200, { success: true }, { name: 'Test Group' }, undefined],
      [400, { error: 'Invalid group' }, {}, { response: { status: 400, data: { error: 'Invalid group' } } }],
      [500, { error: 'Error creating group' }, { name: 'fail' }, new Error('fail')],
    ])('should handle status %i', async (status, expected, body, error) => {
      if (error) {
        axios.post.mockRejectedValueOnce(error);
      } else {
        axios.post.mockResolvedValueOnce({ data: expected });
      }
      const res = await request(server).post('/group/createGroup').send(body);
      expect(res.statusCode).toBe(status);
      expect(res.body).toEqual(expected);
    });
  });
});

describe('Gateway API - Endpoints 16 al 20', () => {
  describe('POST /group/addUserToGroup', () => {
    test.each([
      [200, { added: true }, { groupId: 'g1', userId: 'u1' }, undefined],
      [400, { error: 'Missing data' }, {}, { response: { status: 400, data: { error: 'Missing data' } } }],
      [500, { error: 'Error add user to group' }, { groupId: 'fail', userId: 'fail' }, new Error('fail')],
    ])('should handle status %i', async (status, expected, body, error) => {
      if (error) {
        axios.post.mockRejectedValueOnce(error);
      } else {
        axios.post.mockResolvedValueOnce({ data: expected });
      }
      const res = await request(server).post('/group/addUserToGroup').send(body);
      expect(res.statusCode).toBe(status);
      expect(res.body).toEqual(expected);
    });
  });

  describe('GET /group/listGroupUsers', () => {
    test.each([
      [200, { users: ['user1', 'user2'] }, { groupId: 'g1' }, undefined],
      [404, { error: 'Group not found' }, { groupId: 'invalid' }, { response: { status: 404, data: { error: 'Group not found' } } }],
      [500, { error: 'Error fetching group users' }, { groupId: 'fail' }, new Error('fail')],
    ])('should handle status %i', async (status, expected, query, error) => {
      if (error) {
        axios.get.mockRejectedValueOnce(error);
      } else {
        axios.get.mockResolvedValueOnce({ data: expected });
      }
      const res = await request(server).get('/group/listGroupUsers').query(query);
      expect(res.statusCode).toBe(status);
      expect(res.body).toEqual(expected);
    });
  });

  describe('GET /getUserId', () => {
    test.each([
      [200, { id: 'u123' }, { username: 'testuser' }, undefined],
      [500, { error: 'Failed to retrieve ID' }, {}, { response: { status: 500, data: { error: 'Failed to retrieve ID' } } }],
      [500, { error: 'Error fetching group users' }, { username: 'fail' }, new Error('fail')],
    ])('should handle status %i', async (status, expected, query, error) => {
      if (error) {
        axios.get.mockRejectedValueOnce(error);
      } else {
        axios.get.mockResolvedValueOnce({ data: expected });
      }
      const res = await request(server).get('/getUserId').query(query);
      expect(res.statusCode).toBe(status);
      expect(res.body).toEqual(expected);
    });
  });

  describe('GET /getUsername', () => {
    test.each([
      [200, { username: 'testuser' }, { id: 'u123' }, undefined],
      [404, { error: 'User not found' }, {}, { response: { status: 404, data: { error: 'User not found' } } }],
      [500, { error: 'Error fetching group users' }, { id: 'fail' }, new Error('fail')],
    ])('should handle status %i', async (status, expected, query, error) => {
      if (error) {
        axios.get.mockRejectedValueOnce(error);
      } else {
        axios.get.mockResolvedValueOnce({ data: expected });
      }
      const res = await request(server).get('/getUsername').query(query);
      expect(res.statusCode).toBe(status);
      expect(res.body).toEqual(expected);
    });
  });

  describe('GET /users/:id', () => {
    test.each([
      [200, { name: 'John Doe' }, 'u123', undefined],
      [404, { error: 'User not found' }, 'invalid', { response: { status: 404, data: { error: 'User not found' } } }],
      [500, { error: 'Error fetching user by id' }, 'fail', new Error('fail')],
    ])('should handle status %i', async (status, expected, id, error) => {
      if (error) {
        axios.get.mockRejectedValueOnce(error);
      } else {
        axios.get.mockResolvedValueOnce({ data: expected });
      }
      const res = await request(server).get(`/users/${id}`);
      expect(res.statusCode).toBe(status);
      expect(res.body).toEqual(expected);
    });
  });
});

describe('Gateway API - Endpoints 21 al 25', () => {
  describe('PUT /users/:id', () => {
    test.each([
      [200, { updated: true }, 'u123', { name: 'New Name' }, undefined],
      [400, { error: 'Update failed' }, 'u123', {}, { response: { status: 400, data: { error: 'Update failed' } } }],
      [500, { error: 'Error updating user' }, 'fail', {}, new Error('fail')],
    ])('should handle status %i', async (status, expected, id, body, error) => {
      if (error) {
        axios.put.mockRejectedValueOnce(error);
      } else {
        axios.put.mockResolvedValueOnce({ data: expected });
      }
      const res = await request(server).put(`/users/${id}`).send(body);
      expect(res.statusCode).toBe(status);
      expect(res.body).toEqual(expected);
    });
  });

  describe('POST /group/sendMessage', () => {
    test.each([
      [200, { sent: true }, { groupId: 'g1', message: 'Hi' }, undefined],
      [500, { error: 'Failed to send' }, {}, { response: { status: 500, data: { error: 'Failed to send' } } }],
      [500, { error: 'Error sending group message' }, { groupId: 'fail', message: 'fail' }, new Error('fail')],
    ])('should handle status %i', async (status, expected, body, error) => {
      if (error) {
        axios.post.mockRejectedValueOnce(error);
      } else {
        axios.post.mockResolvedValueOnce({ data: expected });
      }
      const res = await request(server).post('/group/sendMessage').send(body);
      expect(res.statusCode).toBe(status);
      expect(res.body).toEqual(expected);
    });
  });

  describe('GET /group/messages', () => {
    test.each([
      [200, { messages: ['msg1', 'msg2'] }, { groupId: 'g1' }, undefined],
      [500, { error: 'Failed to get messages' }, {}, { response: { status: 500, data: { error: 'Failed to get messages' } } }],
      [500, { error: 'Error fetching group messages' }, { groupId: 'fail' }, new Error('fail')],
    ])('should handle status %i', async (status, expected, query, error) => {
      if (error) {
        axios.get.mockRejectedValueOnce(error);
      } else {
        axios.get.mockResolvedValueOnce({ data: expected });
      }
      const res = await request(server).get('/group/messages').query(query);
      expect(res.statusCode).toBe(status);
      expect(res.body).toEqual(expected);
    });
  });

  describe('GET /mathgame/question', () => {
    test.each([
      [200, { question: '3+5' }, { question: '3+5' }, false, undefined],
      [200, { question: '2+2' }, { question: '2+2' }, true, undefined],
      [500, { error: 'Error fetching math question' }, null, false, { response: { status: 500, data: { error: 'Error fetching math question' } } }],
      [500, { error: 'Error fetching math question' }, null, false, new Error('fail')],
    ])('should handle status %i', async (status, expected, mockData, withBase, error) => {
      if (error) {
        axios.get.mockRejectedValueOnce(error);
      } else {
        axios.get.mockResolvedValueOnce({ data: mockData });
      }
      const url = withBase ? '/mathgame/question/10' : '/mathgame/question';
      const res = await request(server).get(url);
      expect(res.statusCode).toBe(status);
      expect(res.body).toEqual(expected);
    }, 10000);
  });

  describe('POST /mathgame/verify', () => {
    test.each([
      [200, { correct: true }, { answer: 4 }, undefined],
      [400, { error: 'Invalid answer' }, {}, { response: { status: 400, data: { error: 'Invalid answer' } } }],
      [500, { error: 'Error verifying math answer' }, { answer: 1 }, new Error('fail')],
    ])('should handle status %i', async (status, expected, body, error) => {
      if (error) {
        axios.post.mockRejectedValueOnce(error);
      } else {
        axios.post.mockResolvedValueOnce({ data: expected });
      }
      const res = await request(server).post('/mathgame/verify').send(body);
      expect(res.statusCode).toBe(status);
      expect(res.body).toEqual(expected);
    });
  });
});