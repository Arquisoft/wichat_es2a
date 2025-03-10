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
      expect(response.body).toHaveProperty('error', 'Usuario no encontrado');
   });
   
});
