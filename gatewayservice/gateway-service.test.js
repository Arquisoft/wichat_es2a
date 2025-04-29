const request = require('supertest');
const axios = require('axios');
const app = require('./gateway-service');

jest.mock('axios');

afterAll(() => {
  app.close();
});

describe('Gateway Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  
    axios.post.mockImplementation((url) => {
      if (url.includes('/login')) {
        return Promise.resolve({ data: { token: 'mockedToken' } });
      }
      if (url.includes('/adduser')) {
        return Promise.resolve({ data: { userId: 'mockedUserId' } });
      }
      if (url.includes('/ask')) {
        return Promise.resolve({ data: { answer: 'mockedLLMAnswer' } });
      }
      if (url.includes('/group/createGroup') || url.includes('/group/addUserToGroup')) {
        return Promise.resolve({ data: { message: "Operation success" } });
      }
      if (url.includes('/group/sendMessage')) {
        return Promise.resolve({ data: { message: "Operation success" } }); // CAMBIADO
      }
      if (url.includes('/wikidata/verify') || url.includes('/game/start') || url.includes('/game/end') || url.includes('/mathgame/verify')) {
        return Promise.resolve({ data: { success: true } });
      }
      return Promise.resolve({ data: {} }); // fallback
    });
  
    axios.get.mockImplementation((url) => {
      if (url.includes('/wikidata/question')) {
        return Promise.resolve({ data: { questions: ['q1', 'q2'] } });
      }
      if (url.includes('/wikidata/clear')) {
        return Promise.resolve({ data: { cleared: true } });
      }
      if (url.includes('/game/statistics')) {
        return Promise.resolve({ data: [{ correct: 10, wrong: 2 }] });
      }
      if (url.includes('/conversations/')) {
        return Promise.resolve({ data: { history: [] } });
      }
      if (url.includes('/group/listGroups')) {
        return Promise.resolve({ data: { groups: ['group1', 'group2'] } }); // OK
      }
      if (url.includes('/group/listGroupUsers')) {
        return Promise.resolve({ data: { users: ['user1', 'user2'] } }); // OK
      }
      if (url.includes('/group/messages')) {
        return Promise.resolve({ data: { messages: ['msg1', 'msg2'] } }); // CAMBIADO
      }
      if (url.includes('/getUserId')) {
        return Promise.resolve({ data: { id: 'user123' } });
      }
      if (url.includes('/getUsername')) {
        return Promise.resolve({ data: { username: 'testuser' } });
      }
      if (url.includes('/users/')) {
        return Promise.resolve({ data: { id: 'user1', name: 'Test User' } });
      }
      if (url.includes('/mathgame/question')) {
        return Promise.resolve({ data: { expr: '2+2', correct: 4, options: [4, 5, 6, 7] } });
      }
      return Promise.resolve({ data: {} }); // fallback
    });
  
    axios.put.mockImplementation(() => Promise.resolve({ data: { updated: true } }));
    axios.delete.mockImplementation(() => Promise.resolve({ data: { deleted: true } }));
  });
  

  it('should respond to health check', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'OK' });
  });

  it('should forward login request to auth service', async () => {
    const response = await request(app).post('/login').send({ username: 'testuser', password: 'testpassword' });
    expect(response.status).toBe(200);
    expect(response.body.token).toBe('mockedToken');
  });

  it('should create a group', async () => {
    const response = await request(app).post('/group/createGroup').send({ name: 'testGroup' });
    expect(response.status).toBe(200);
  });

  it('should list groups', async () => {
    const response = await request(app).get('/group/listGroups');
    expect(response.status).toBe(200);
  });

  it('should add user to group', async () => {
    const response = await request(app).post('/group/addUserToGroup').send({ userId: 'user123', groupId: 'group123' });
    expect(response.status).toBe(200);
  });

  it('should list group users', async () => {
    const response = await request(app).get('/group/listGroupUsers');
    expect(response.status).toBe(200);
  });

  it('should send group message', async () => {
    const response = await request(app).post('/group/sendMessage').send({ message: 'Hello' });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Operation success');
  });

  it('should get group messages', async () => {
    const response = await request(app).get('/group/messages');
    expect(response.status).toBe(200);
    expect(response.body.messages).toEqual(expect.arrayContaining(['msg1', 'msg2']));
  });

  // ---------- USER INFO ----------
  it('should get userId', async () => {
    const response = await request(app).get('/getUserId');
    expect(response.status).toBe(200);
  });

  it('should get username', async () => {
    const response = await request(app).get('/getUsername');
    expect(response.status).toBe(200);
  });

  it('should get user by id', async () => {
    const response = await request(app).get('/users/123');
    expect(response.status).toBe(200);
    expect(response.body.id).toBe('user1');
  });

  it('should update user by id', async () => {
    const response = await request(app).put('/users/123').send({ name: 'updatedName' });
    expect(response.status).toBe(200);
  });

  // ---------- MATHGAME ----------
  it('should get mathgame question', async () => {
    const response = await request(app).get('/mathgame/question');
    expect(response.status).toBe(200);
    expect(response.body.expr).toBe('2+2');
  });

  it('should verify mathgame answer', async () => {
    const response = await request(app).post('/mathgame/verify').send({ choice: 4, correct: 4 });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

});
