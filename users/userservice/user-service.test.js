const request = require('supertest');
const bcrypt = require('bcrypt');
const { MongoMemoryServer } = require('mongodb-memory-server');

const User = require('./user-model');

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI = mongoUri;
  app = require('./user-service');
});

afterAll(async () => {
  app.close();
  await mongoServer.stop();
});

describe('User Service', () => {
  beforeEach(async () => {
    await User.deleteMany();
  });

  it('should add a new user on POST /adduser', async () => {
    const newUser = {
      username: 'testuser',
      password: 'testpassword',
    };

    const response = await request(app).post('/adduser').send(newUser);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('username', 'testuser');

    // Check if the user is inserted into the database
    const userInDb = await User.findOne({ username: 'testuser' });

    // Assert that the user exists in the database
    expect(userInDb).not.toBeNull();
    expect(userInDb.username).toBe('testuser');

    // Assert that the password is encrypted
    const isPasswordValid = await bcrypt.compare('testpassword', userInDb.password);
    expect(isPasswordValid).toBe(true);
  });

    it('should add a new friend successfully', async () => {
      await User.create([
        { username: 'testuser', password: await bcrypt.hash('pass1', 10) },
        { username: 'testFriend', password: await bcrypt.hash('pass2', 10) },
      ]);

      const response = await request(app)
        .post('/addFriend')
        .send({ username: 'testuser', friendUsername: 'testFriend' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Ahora testuser y testFriend son amigos.');

      const user = await User.findOne({ username: 'testuser' }).populate('friends');
      const friend = await User.findOne({ username: 'testFriend' }).populate('friends');

      expect(user.friends.some(f => f.username === 'testFriend')).toBeTruthy();
      expect(friend.friends.some(f => f.username === 'testuser')).toBeTruthy();
    });

    it('should not allow adding oneself as a friend', async () => {
      await User.create([
        { username: 'testuser', password: await bcrypt.hash('pass1', 10) },
      ]);

      const response = await request(app)
        .post('/addFriend')
        .send({ username: 'testuser', friendUsername: 'testuser' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('No puedes agregarte a ti mismo como amigo');
    });

    it('should return 404 if the friend does not exist', async () => {
      await User.create([
        { username: 'testuser', password: await bcrypt.hash('pass1', 10) },
      ]);

      const response = await request(app)
        .post('/addFriend')
        .send({ username: 'testuser', friendUsername: 'nonExistentUser' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('El usuario no fue encontrado');
    });

    it('should not add an existing friend again', async () => {

      await User.create([
        { username: 'testuser', password: await bcrypt.hash('pass1', 10) },
        { username: 'testFriend', password: await bcrypt.hash('pass2', 10) },
      ]);

      await request(app)
        .post('/addFriend')
        .send({ username: 'testuser', friendUsername: 'testFriend' });

      const response = await request(app)
        .post('/addFriend')
        .send({ username: 'testuser', friendUsername: 'testFriend' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Ya tienes a este usuario como amigo.');
  });
  
    it('should list users on GET /listUsers', async () => {
      await User.create([
        { username: 'user1', password: await bcrypt.hash('pass1', 10) },
        { username: 'user2', password: await bcrypt.hash('pass2', 10) },
      ]);
  
      const response = await request(app).get('/listUsers');
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(2);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ username: 'user1' }),
          expect.objectContaining({ username: 'user2' }),
        ])
      );
    });
  
    it('should get a specific user on GET /user/:username', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      await User.create({ username: 'specificUser', password: hashedPassword });
  
      const response = await request(app).get('/user/specificUser');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('username', 'specificUser');
    });
  
    it('should return 404 if user not found on GET /user/:username', async () => {
      const response = await request(app).get('/user/nonexistentUser');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
   });
});
