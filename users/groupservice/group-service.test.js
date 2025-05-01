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
jest.mock('./group-model', () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  mockImplementation: jest.fn()
}));

jest.mock('./group-message-model', () => ({
  find: jest.fn(),
  create: jest.fn()
}));

const Group = require('./group-model');
const GroupMessage = require('./group-message-model');
const app = require('./group-service');

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.clearAllMocks();
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
