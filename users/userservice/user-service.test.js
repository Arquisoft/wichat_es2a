const request = require('supertest');
const bcrypt = require('bcrypt');
const { MongoMemoryServer } = require('mongodb-memory-server');

const User = require('./user-model');
const Message = require('./message-model');
const PrivateMessage = require('./private-message-model');

let mongoServer;
let app;

afterAll(async () => {
  if (app && typeof app.close === 'function') {
    await app.close();
  }
  if (mongoServer && typeof mongoServer.stop === 'function') {
    await mongoServer.stop();
  }
});

beforeAll(async () => {
  jest.setTimeout(30000); 
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI = mongoUri;
  app = require('./user-service');
});

describe('User Service', () => {
  beforeEach(async () => {
    await User.deleteMany();
    await Message.deleteMany({});
    await PrivateMessage.deleteMany({});
  });

  it('should add a new user on POST /adduser', async () => {
    const newUser = {
      username: 'testuser',
      password: 'Testpassword1!', // Cumple requisitos de seguridad
      confirmPassword: 'Testpassword1!',
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
    const isPasswordValid = await bcrypt.compare('Testpassword1!', userInDb.password);
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

    // Tests for partial user search

    it ('should return users matching partial username on GET /searchUsers', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      await User.create({ username: 'specificUser', password: hashedPassword, avatarOptions: {} });
      const res = await request(app).get('/searchUsers').query({ query: 'specif' });
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('username', 'specificUser');
    });

    it ('should return error 400 if no query is given on GET /searchUsers', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      await User.create({ username: 'specificUser', password: hashedPassword, avatarOptions: {} });
      const res = await request(app).get('/searchUsers');
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Se requiere un término de búsqueda');
    });

    // Tests for removing a friend

    it ('should remove a friend correctly', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      let user1 = await User.create({ username: 'user1', password: hashedPassword, avatarOptions: {} });
      let user2 = await User.create({ username: 'user2', password: hashedPassword, avatarOptions: {} });
      user1.friends.push(user2._id);
      user2.friends.push(user1._id);
      await user1.save();
      await user2.save();

      const res = await request(app).post('/removeFriend').send({
        username: user1.username,
        friendUsername: user2.username,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', `${user2.username} ha sido eliminado de tus amigos.`);

      const updatedUser1 = await User.findById(user1._id);
      const updatedUser2 = await User.findById(user2._id);

      expect(updatedUser1.friends).not.toContainEqual(user2._id);
      expect(updatedUser2.friends).not.toContainEqual(user1._id);
    });

    it ('should return error 400 if tried to remove yourself from friends', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      let user1 = await User.create({ username: 'user1', password: hashedPassword, avatarOptions: {} });

      const res = await request(app).post('/removeFriend').send({
        username: user1.username,
        friendUsername: user1.username,
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'No puedes eliminarte a ti mismo de la lista de amigos');
    });

    it ('should return error 404 if user does not exist', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      let user1 = await User.create({ username: 'user1', password: hashedPassword, avatarOptions: {} });

      const res = await request(app).post('/removeFriend').send({
        username: user1.username,
        friendUsername: 'nonExistentUser',
      });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Usuario o amigo no encontrado');
    });

    it ('should return error 400 if users are not friends', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      let user1 = await User.create({ username: 'user1', password: hashedPassword, avatarOptions: {} });
      let user2 = await User.create({ username: 'user2', password: hashedPassword, avatarOptions: {} });

      const res = await request(app).post('/removeFriend').send({
        username: user1.username,
        friendUsername: user2.username,
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'No son amigos');
    });

    // Tests for sending a friend request

    it ('should send a friend request correctly', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      let user1 = await User.create({ username: 'user1', password: hashedPassword, avatarOptions: {} });
      let user2 = await User.create({ username: 'user2', password: hashedPassword, avatarOptions: {} });

      const res = await request(app).post('/sendFriendRequest').send({
        username: user1.username,
        friendUsername: user2.username,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', `Solicitud de amistad enviada a ${user2.username}`);

      const updatedUser2 = await User.findById(user2._id);
      expect(updatedUser2.friendRequests).toContainEqual(user1._id);
    });

    it ('should return error 400 if tried to send a request to yourself', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      let user1 = await User.create({ username: 'user1', password: hashedPassword, avatarOptions: {} });

      const res = await request(app).post('/sendFriendRequest').send({
        username: user1.username,
        friendUsername: user1.username,
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'No puedes enviarte una solicitud de amistad a ti mismo');
    });

    it ('should return error 404 if user does not exist', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      let user1 = await User.create({ username: 'user1', password: hashedPassword, avatarOptions: {} });

      const res = await request(app).post('/sendFriendRequest').send({
        username: user1.username,
        friendUsername: 'nonExistentUser',
      });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Usuario o amigo no encontrado');
    });

    it ('should return error 400 if users are already friends', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      let user1 = await User.create({ username: 'user1', password: hashedPassword, avatarOptions: {} });
      let user2 = await User.create({ username: 'user2', password: hashedPassword, avatarOptions: {} });
      user1.friends.push(user2._id);
      user2.friends.push(user1._id);
      await user1.save();
      await user2.save();

      const res = await request(app).post('/sendFriendRequest').send({
        username: user1.username,
        friendUsername: user2.username,
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Ya son amigos');
    });

    it ('should return error 400 if a request has already been sent', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      let user1 = await User.create({ username: 'user1', password: hashedPassword, avatarOptions: {} });
      let user2 = await User.create({ username: 'user2', password: hashedPassword, avatarOptions: {} });

      await request(app).post('/sendFriendRequest').send({
        username: user1.username,
        friendUsername: user2.username,
      });

      const res = await request(app).post('/sendFriendRequest').send({
        username: user1.username,
        friendUsername: user2.username,
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Ya has enviado una solicitud de amistad a este usuario');
    });

    // Tests for accepting a friend request

    it ('should accept a friend request correctly', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      let user1 = await User.create({ username: 'user1', password: hashedPassword, avatarOptions: {} });
      let user2 = await User.create({ username: 'user2', password: hashedPassword, avatarOptions: {} });

      await request(app).post('/sendFriendRequest').send({
        username: user1.username,
        friendUsername: user2.username,
      });

      const res = await request(app).post('/acceptFriendRequest').send({
        username: user2.username,
        friendUsername: user1.username,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', `¡Ahora son amigos! ${user2.username} y ${user1.username}`);

      const updatedUser1 = await User.findById(user1._id);
      const updatedUser2 = await User.findById(user2._id);

      expect(updatedUser1.friends).toContainEqual(user2._id);
      expect(updatedUser2.friends).toContainEqual(user1._id);
    });

    it ('should return error 404 if user does not exist', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      let user1 = await User.create({ username: 'user1', password: hashedPassword, avatarOptions: {} });

      const res = await request(app).post('/acceptFriendRequest').send({
        username: 'nonExistentUser',
        friendUsername: user1.username,
      });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Usuario no encontrado');
    });

    it ('should return error 404 if friend does not exist', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      let user1 = await User.create({ username: 'user1', password: hashedPassword, avatarOptions: {} });

      const res = await request(app).post('/acceptFriendRequest').send({
        username: user1.username,
        friendUsername: 'nonExistentFriend',
      });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Usuario no encontrado');
    });

    it ('should return error 400 if no request has been sent', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      let user1 = await User.create({ username: 'user1', password: hashedPassword, avatarOptions: {} });
      let user2 = await User.create({ username: 'user2', password: hashedPassword, avatarOptions: {} });

      const res = await request(app).post('/acceptFriendRequest').send({
        username: user2.username,
        friendUsername: user1.username,
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'No hay solicitud pendiente de este usuario');
    });

    // Tests for rejecting a friend request

    it ('should reject a friend request correctly', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      let user1 = await User.create({ username: 'user1', password: hashedPassword, avatarOptions: {} });
      let user2 = await User.create({ username: 'user2', password: hashedPassword, avatarOptions: {} });

      await request(app).post('/sendFriendRequest').send({
        username: user1.username,
        friendUsername: user2.username,
      });

      const res = await request(app).post('/rejectFriendRequest').send({
        username: user2.username,
        friendUsername: user1.username,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', `Solicitud de amistad rechazada de ${user1.username}`);

      const updatedUser1 = await User.findById(user1._id);
      const updatedUser2 = await User.findById(user2._id);

      expect(updatedUser1.friendRequests).not.toContainEqual(user2._id);
      expect(updatedUser2.friendRequests).not.toContainEqual(user1._id);
    });

    it ('should return error 404 if user does not exist', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      let user1 = await User.create({ username: 'user1', password: hashedPassword, avatarOptions: {} });

      const res = await request(app).post('/rejectFriendRequest').send({
        username: 'nonExistentUser',
        friendUsername: user1.username,
      });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Usuario no encontrado');
    });

    it ('should return error 404 if friend does not exist', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      let user1 = await User.create({ username: 'user1', password: hashedPassword, avatarOptions: {} });

      const res = await request(app).post('/rejectFriendRequest').send({
        username: user1.username,
        friendUsername: 'nonExistentFriend',
      });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Usuario no encontrado');
    });

    it ('should return error 400 if no request has been sent', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      let user1 = await User.create({ username: 'user1', password: hashedPassword, avatarOptions: {} });
      let user2 = await User.create({ username: 'user2', password: hashedPassword, avatarOptions: {} });

      const res = await request(app).post('/rejectFriendRequest').send({
        username: user2.username,
        friendUsername: user1.username,
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'No hay solicitud pendiente de este usuario');
    });

    // Tests for listing friend requests

    it ('should return all friend requests correctly', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      let user1 = await User.create({ username: 'user1', password: hashedPassword, avatarOptions: {} });
      let user2 = await User.create({ username: 'user2', password: hashedPassword, avatarOptions: {} });

      await request(app).post('/sendFriendRequest').send({
        username: user1.username,
        friendUsername: user2.username,
      });

      const res = await request(app).get('/listRequests').query({ username: user2.username });

      expect(res.statusCode).toBe(200);
      expect(res.body.requests).toHaveLength(1);
      expect(res.body.requests[0].toString()).toBe(user1._id.toString());
    });

    it ('should return error 404 if user does not exist', async () => {
      const res = await request(app).get('/listRequests').query({ username: 'nonExistentUser' });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Usuario no encontrado');
    });

    it ('should return error 400 if no username param is given', async () => {
      const res = await request(app).get('/listRequests').query({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Se requiere el nombre de usuario');
    });

    // Tests for getting ID by username

    it ('should return user ID given username', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      let user1 = await User.create({ username: 'user1', password: hashedPassword, avatarOptions: {} });
      
      const res = await request(app).get('/getUserId').query({ username: user1.username });
      
      expect(res.body).toHaveProperty('userId');
      expect(res.body.userId).toBe(user1._id.toString());
    });

    it ('should return error 404 if user does not exist', async () => {
      const res = await request(app).get('/getUserId').query({ username: 'nonExistentUser' });
      
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'User not found');
    });

    it ('should return error 400 if username param is not given', async () => {
      const res = await request(app).get('/getUserId').query({});
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Username is required');
    });

    // Tests for getting username by ID

    it ('should return username given user ID', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      let user1 = await User.create({ username: 'user1', password: hashedPassword, avatarOptions: {} });
      
      const res = await request(app).get('/getUsername').query({ userId: user1._id.toString() });
      
      expect(res.body).toHaveProperty('username');
      expect(res.body.username).toBe(user1.username);
    });

    it ('should return error 404 if user does not exist', async () => {
      const res = await request(app).get('/getUsername').query({ userId: '60a2b1d2b9e8d2c35b9a3e7e' });
      
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'User not found');
    });

    it ('should return error 400 if user ID param is not given', async () => {
      const res = await request(app).get('/getUsername').query({});
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'User ID is required');
    });

    // Tests for sending a message to global chat

    it ('should send a message to global chat correctly', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      let user = await User.create({ username: 'user1', password: hashedPassword, avatarOptions: {} });
      
      const res = await request(app)
        .post('/sendMessage')
        .send({ username: user.username, content: '¡Hola mundo!' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Mensaje enviado');

      const message = await Message.findOne({ content: '¡Hola mundo!' });
      expect(message).not.toBeNull();
      expect(message.sender.toString()).toBe(user._id.toString());
    });

    it ('should return error 400 if no username param is given', async () => {
      const res = await request(app)
        .post('/sendMessage')
        .send({ content: '¡Hola mundo!' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Faltan datos requeridos');
    });

    it ('should return error 400 if no content param is given', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      let user = await User.create({ username: 'user1', password: hashedPassword, avatarOptions: {} });

      const res = await request(app)
        .post('/sendMessage')
        .send({ username: user.username });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Faltan datos requeridos');
    });

    it ('should return error 404 if no user does not exist', async () => {
      const res = await request(app)
        .post('/sendMessage')
        .send({ username: 'nonExistentUser', content: '¡Hola mundo!' });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Usuario no encontrado');
    });

    // Tests for getting messages from global chat

    it ('should return last messages from global chat', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      let user = await User.create({ username: 'user1', password: hashedPassword, avatarOptions: {} });
      await Message.create({ content: 'Primer mensaje', sender: user._id });
      await Message.create({ content: 'Segundo mensaje', sender: user._id });
      await Message.create({ content: 'Tercer mensaje', sender: user._id });

      const res = await request(app).get('/getMessages');

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(3);
      expect(res.body[0]).toHaveProperty('content', 'Primer mensaje');
    });

    it ('should return an empty array if there are no messages', async () => {
      const res = await request(app).get('/getMessages');

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    // Tests for sending a private message

    it ('should send a private message correctly', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      let sender = await User.create({ username: 'user1', password: hashedPassword, avatarOptions: {} });
      let receiver = await User.create({ username: 'user2', password: hashedPassword, avatarOptions: {} });

      const res = await request(app)
        .post('/sendPrivateMessage')
        .send({
          senderUsername: sender.username,
          receiverUsername: receiver.username,
          content: 'Hola',
        });

      expect(res.body).toHaveProperty('message', 'Mensaje privado enviado');

      const message = await PrivateMessage.findOne();
      expect(message).toBeDefined();
      expect(message.content).toBe('Hola');
      expect(message.sender.toString()).toBe(sender._id.toString());
      expect(message.receiver.toString()).toBe(receiver._id.toString());
    });

    it ('should return error 400 if any param is not given', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      let sender = await User.create({ username: 'user1', password: hashedPassword, avatarOptions: {} });
      let receiver = await User.create({ username: 'user2', password: hashedPassword, avatarOptions: {} });

      const res = await request(app)
        .post('/sendPrivateMessage')
        .send({
          senderUsername: sender.username,
          receiverUsername: receiver.username,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Faltan datos requeridos');
    });

    it ('should return error 404 if receiver does not exist', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      let sender = await User.create({ username: 'user1', password: hashedPassword, avatarOptions: {} });

      const res = await request(app)
        .post('/sendPrivateMessage')
        .send({
          senderUsername: sender.username,
          receiverUsername: 'nonExistentUser',
          content: 'Hola',
        });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Usuario no encontrado');
    });

    it ('should return error 404 if sender does not exist', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      let receiver = await User.create({ username: 'user1', password: hashedPassword, avatarOptions: {} });

      const res = await request(app)
        .post('/sendPrivateMessage')
        .send({
          senderUsername: 'nonExistentUser',
          receiverUsername: receiver.username,
          content: 'Hola',
        });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Usuario no encontrado');
    });

    // Tests for getting private messages

    it ('should return private messages correctly', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      let sender = await User.create({ username: 'user1', password: hashedPassword, avatarOptions: {} });
      let receiver = await User.create({ username: 'user2', password: hashedPassword, avatarOptions: {} });

      await request(app)
        .post('/sendPrivateMessage')
        .send({
          senderUsername: sender.username,
          receiverUsername: receiver.username,
          content: 'Hola',
        });

      const res = await request(app).get(`/getPrivateMessages/${sender._id}/${receiver._id}`);

      expect(res.body.length).toBe(1);
      expect(res.body[0]).toHaveProperty('content', 'Hola');
      expect(res.body[0].sender.username).toBe(sender.username);
      expect(res.body[0].receiver.username).toBe(receiver.username);
    });

    it ('should return an empty array if there are no messages', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      let sender = await User.create({ username: 'user1', password: hashedPassword, avatarOptions: {} });
      let receiver = await User.create({ username: 'user2', password: hashedPassword, avatarOptions: {} });

      const res = await request(app).get(`/getPrivateMessages/${sender._id}/${receiver._id}`);

      expect(res.body.length).toBe(0);
    });

    // Tests for adding user (extended)

    it ('should return error 400 if username already exists', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      const user = new User({
        username: 'existingUser',
        password: hashedPassword,
        avatarOptions: 'default',
      });
      await user.save();
  
      const newUser = {
        username: 'existingUser',
        password: hashedPassword,
        confirmPassword: hashedPassword,
        avatarOptions: 'default',
      };
  
      const res = await request(app)
        .post('/adduser')
        .send(newUser);
  
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'El nombre de usuario ya existe');
    });

    it('should return an error if the username length is invalid', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      const newUser = {
        username: 'us',
        password: hashedPassword,
        confirmPassword: hashedPassword,
        avatarOptions: 'default',
      };
  
      const response = await request(app)
        .post('/adduser')
        .send(newUser);
  
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('El nombre de usuario debe tener entre 3 y 20 caracteres.');
    });

    it('should return an error if the password complexity is invalid', async () => {
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      const newUser = {
        username: 'newUser123',
        password: hashedPassword,
        confirmPassword: hashedPassword,
        avatarOptions: 'default',
      };
  
      const response = await request(app)
        .post('/adduser')
        .send(newUser);
  
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('La contraseña debe contener al menos una letra mayúscula, una minúscula, un número y un caracter especial');
    });

    it('should return an error if the passwords do not match', async () => {
      const newUser = {
        username: 'newUser123',
        password: 'Password123!',
        confirmPassword: 'Password321!',
        avatarOptions: 'default',
      };
  
      const response = await request(app)
        .post('/adduser')
        .send(newUser);
  
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Las contraseñas no coinciden.');
    });

    // Tests for updating user

});
