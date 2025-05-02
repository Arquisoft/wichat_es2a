const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');

jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue({}),
  connection: {}
}));
jest.mock('axios', () => ({
  get: jest.fn().mockResolvedValue({ data: { username: 'mockuser' } })
}));
jest.mock('./group-model', () => {
  const findOne = jest.fn();
  const find = jest.fn();
  function Group(data) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
  }
  Group.findOne = findOne;
  Group.find = find;
  return Group;
});

jest.mock('./group-message-model', () => {
  const find = jest.fn();
  function GroupMessage(data) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
  }
  GroupMessage.find = find;
  return GroupMessage;
});

const Group = require('./group-model');
const GroupMessage = require('./group-message-model');
const app = require('./group-service');

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.clearAllMocks();
});
it('should create a group', async () => {
  Group.findOne.mockResolvedValue(null);
  const res = await request(app)
    .post('/createGroup')
    .send({ groupName: 'TestGroup', userId: '507f1f77bcf86cd799439012' });
  expect(res.statusCode).toBe(200);
  expect(res.body.groupName).toBe('TestGroup');
  expect(res.body.users[0].user).toBe('507f1f77bcf86cd799439012');
  expect(res.body.users[0].role).toBe('admin');
});

  it('should not create a group with missing fields', async () => {
    const res = await request(app)
      .post('/createGroup')
      .send({ groupName: 'TestGroup' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Missing required field/);
  });

  it('should not create a group with duplicate name', async () => {
    Group.findOne.mockResolvedValue({ groupName: 'TestGroup' });
    const res = await request(app)
      .post('/createGroup')
      .send({ groupName: 'TestGroup', userId: '507f1f77bcf86cd799439012' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Ya existe un grupo/);
  });

  it('should add a user to a group', async () => {
    const group = {
      users: [{ user: '507f1f77bcf86cd799439011', role: 'admin' }],
      memberCount: 1,
      save: jest.fn().mockResolvedValue()
    };
    group.users.some = jest.fn().mockReturnValue(false);
    Group.findOne.mockResolvedValue(group);
    const res = await request(app)
      .post('/addUserToGroup')
      .send({ groupName: 'TestGroup', userId: '507f1f77bcf86cd799439012' });
    expect(res.statusCode).toBe(200);
    expect(res.body.group.users.length).toBe(2);
  });

  it('should not add a user twice to a group', async () => {
    const group = {
      users: [
        { user: '507f1f77bcf86cd799439011', role: 'admin' },
        { user: '507f1f77bcf86cd799439012', role: 'member' }
      ],
      memberCount: 2,
      save: jest.fn().mockResolvedValue()
    };
    group.users.some = jest.fn().mockReturnValue(true);
    Group.findOne.mockResolvedValue(group);
    const res = await request(app)
      .post('/addUserToGroup')
      .send({ groupName: 'TestGroup', userId: '507f1f77bcf86cd799439012' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Ya eres miembro/);
  });

  it('should list group users', async () => {
    const group = {
      groupName: 'TestGroup',
      users: [{ user: '507f1f77bcf86cd799439011', role: 'admin' }]
    };
    Group.findOne.mockResolvedValue(group);
    const res = await request(app)
      .get('/listGroupUsers')
      .query({ groupName: 'TestGroup' });
    expect(res.statusCode).toBe(200);
    expect(res.body.groupName).toBe('TestGroup');
    expect(res.body.users[0].username).toBe('mockuser');
  });

  it('should list groups for a user', async () => {
    Group.find.mockResolvedValue([
      {
        _id: 'groupid',
        groupName: 'TestGroup',
        memberCount: 2,
        createdAt: new Date(),
        users: [{ user: '507f1f77bcf86cd799439011', role: 'admin' }]
      }
    ]);
    const res = await request(app)
      .get('/listGroups')
      .query({ userId: '507f1f77bcf86cd799439011' });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].groupName).toBe('TestGroup');
  });

  it('should return error for missing groupName in listGroupUsers', async () => {
    const res = await request(app)
      .get('/listGroupUsers')
      .query({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Group name is required/);
  });

  it('should return error for missing userId in listGroups', async () => {
    const res = await request(app)
      .get('/listGroups')
      .query({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/userId is required/);
  });

  it('should return error for missing fields in sendMessage', async () => {
    const res = await request(app)
      .post('/group/sendMessage')
      .send({ groupName: 'TestGroup', username: 'mockuser' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Missing required field/);
  });
it('should send and get group messages', async () => {
  const group = {
    users: [{ user: '507f1f77bcf86cd799439011', role: 'admin' }],
    save: jest.fn().mockResolvedValue()
  };
  Group.findOne.mockResolvedValue(group);

  GroupMessage.find.mockImplementation(() => ({
    sort: () => Promise.resolve([
      { groupName: 'TestGroup', username: 'mockuser', message: 'Hello group!' }
    ])
  }));

  const sendRes = await request(app)
    .post('/group/sendMessage')
    .send({ groupName: 'TestGroup', username: 'mockuser', message: 'Hello group!' });
  expect(sendRes.statusCode).toBe(200);
  expect(sendRes.body.message).toBe('Hello group!');

  const getRes = await request(app)
    .get('/group/messages')
    .query({ groupName: 'TestGroup' });
  expect(getRes.statusCode).toBe(200);
  expect(getRes.body[0].message).toBe('Hello group!');
  expect(getRes.body[0].username).toBe('mockuser');
});
it('should return 400 if groupName is too long', async () => {
  Group.findOne.mockResolvedValue(null);
  const res = await request(app)
    .post('/createGroup')
    .send({ groupName: 'a'.repeat(21), userId: '507f1f77bcf86cd799439012' });
  expect(res.statusCode).toBe(400);
  expect(res.body.error).toMatch(/no puede superar los 20 caracteres/);
});
it('should return 404 if group does not exist when adding user', async () => {
  Group.findOne.mockResolvedValue(null);
  const res = await request(app)
    .post('/addUserToGroup')
    .send({ groupName: 'Inexistente', userId: '507f1f77bcf86cd799439012' });
  expect(res.statusCode).toBe(404);
});
it('should return 404 if group does not exist when listing users', async () => {
  Group.findOne.mockResolvedValue(null);
  const res = await request(app)
    .get('/listGroupUsers')
    .query({ groupName: 'Inexistente' });
  expect(res.statusCode).toBe(404);
  expect(res.body.error).toMatch(/Group not found/);
});
it('should return 400 if error occurs when listing group users', async () => {
  Group.findOne.mockRejectedValue(new Error('DB error'));
  const res = await request(app)
    .get('/listGroupUsers')
    .query({ groupName: 'TestGroup' });
  expect(res.statusCode).toBe(400);
  expect(res.body.error).toMatch(/DB error/);
});
it('should return empty array if user has no groups', async () => {
  Group.find.mockResolvedValue([]);
  const res = await request(app)
    .get('/listGroups')
    .query({ userId: '507f1f77bcf86cd799439011' });
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual([]);
});
it('should return empty array if error occurs when listing groups', async () => {
  Group.find.mockRejectedValue(new Error('DB error'));
  const res = await request(app)
    .get('/listGroups')
    .query({ userId: '507f1f77bcf86cd799439011' });
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual([]);
});
it('should return 404 if group does not exist when sending message', async () => {
  Group.findOne.mockResolvedValue(null);
  const res = await request(app)
    .post('/group/sendMessage')
    .send({ groupName: 'Inexistente', username: 'mockuser', message: 'Hola' });
  expect(res.statusCode).toBe(404);
});
it('should return 400 if error occurs when getting group messages', async () => {
  GroupMessage.find.mockImplementation(() => ({
    sort: () => { throw new Error('DB error'); }
  }));
  const res = await request(app)
    .get('/group/messages')
    .query({ groupName: 'TestGroup' });
  expect(res.statusCode).toBe(400);
  expect(res.body.error).toMatch(/DB error/);
});
it('should return 400 if groupName is not a string in createGroup', async () => {
  const res = await request(app)
    .post('/createGroup')
    .send({ groupName: { $ne: '' }, userId: '507f1f77bcf86cd799439012' });
  expect(res.statusCode).toBe(400);
  expect(res.body.error).toMatch(/superar los 20 caracteres/);
});

it('should return 400 if groupName is not a string in addUserToGroup', async () => {
  const res = await request(app)
    .post('/addUserToGroup')
    .send({ groupName: { $ne: '' }, userId: '507f1f77bcf86cd799439012' });
  expect(res.statusCode).toBe(400);
  expect(res.body.error).toMatch(/Invalid groupName/);
});

it('should return 400 if groupName is not a string in listGroupUsers', async () => {
  const res = await request(app)
    .get('/listGroupUsers')
    .query({ groupName: { $ne: '' } });
  expect(res.statusCode).toBe(400);
  expect(res.body.error).toMatch(/Invalid groupName/);
});

it('should return 400 if groupName is not a string in sendMessage', async () => {
  const res = await request(app)
    .post('/group/sendMessage')
    .send({ groupName: { $ne: '' }, username: 'mockuser', message: 'Hola' });
  expect(res.statusCode).toBe(400);
  expect(res.body.error).toMatch(/Invalid groupName/);
});

it('should return 400 if userId is not a valid ObjectId in listGroups', async () => {
  const res = await request(app)
    .get('/listGroups')
    .query({ userId: 'notavalidobjectid' });
  expect(res.statusCode).toBe(400);
  expect(res.body.error).toMatch(/Invalid userId/);
});