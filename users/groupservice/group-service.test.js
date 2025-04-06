const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Group = require('./group-model');
const User = require('../userservice/user-model'); // Import User model

jest.mock('./group-service', () => {
  const express = require('express');
  const app = express();
  app.use(express.json());
  return app;
});

const server = require('./group-service'); 

let mongoServer;

async function getUserIdByUsername(username) {
  if (!username) {
    throw new Error('Username is required');
  }
  const user = await User.findOne({ username });
  if (!user) {
    throw new Error('User not found');
  }
  return user._id;
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(mongoUri); // Eliminar opciones obsoletas
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
  if (server && server.close) {
    server.close();
  }
});

describe('Group Service API', () => {
  let userId;

  beforeEach(async () => {
    await Group.deleteMany({});
    await User.deleteMany({}); // Limpiar la colección de usuarios

    // Crear un usuario y obtener su userId usando la función getUserIdByUsername
    const username = 'testuser';
    await User.create({ username, password: 'testpassword' });
    userId = (await getUserIdByUsername(username)).toString();
  });

  test('POST /createGroup - debería crear un nuevo grupo', async () => {
    const response = await request(server)
      .post('/createGroup')
      .send({ groupName: 'TestGroup', userId });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('groupName', 'TestGroup');
    expect(response.body).toHaveProperty('memberCount', 1);
  });

  test('POST /addUserToGroup - debería añadir un usuario a un grupo existente', async () => {
    const group = new Group({
      groupName: 'TestGroup',
      memberCount: 1,
      createdAt: new Date(),
      users: [{ user: userId, role: 'admin' }],
    });
    await group.save();

    const newUser = await User.create({ username: 'newuser', password: 'newpassword' });
    const newUserId = (await getUserIdByUsername('newuser')).toString();

    const response = await request(server)
      .post('/addUserToGroup')
      .send({ groupName: 'TestGroup', userId: newUserId });

    expect(response.status).toBe(200);
    expect(response.body.group.users).toHaveLength(2);
  });

  test('GET /listGroupUsers - debería listar los usuarios de un grupo', async () => {
    const group = new Group({
      groupName: 'TestGroup',
      memberCount: 1,
      createdAt: new Date(),
      users: [{ user: userId, role: 'admin' }],
    });
    await group.save();

    const response = await request(server)
      .get('/listGroupUsers')
      .query({ groupName: 'TestGroup' });

    expect(response.status).toBe(200);
    expect(response.body.users).toHaveLength(1);
    expect(response.body.users[0]).toHaveProperty('role', 'admin');
  });

  test('GET /listGroups - debería listar los grupos de un usuario', async () => {
    const group = new Group({
      groupName: 'TestGroup',
      memberCount: 1,
      createdAt: new Date(),
      users: [{ user: userId, role: 'admin' }],
    });
    await group.save();

    const response = await request(server)
      .get('/listGroups')
      .query({ userId });

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toHaveProperty('groupName', 'TestGroup');
  });

  test('GET /getUserId - should return user ID for a username', async () => {
    await User.create({ username: 'testuser', _id: userId, password: 'testpassword' });

    const response = await request(server)
      .get('/getUserId')
      .query({ username: 'testuser' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('userId', userId.toString());
  });
});