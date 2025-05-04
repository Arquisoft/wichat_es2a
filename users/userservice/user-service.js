const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./user-model');
const cors = require('cors');
const Message = require('./message-model');
const PrivateMessage = require('./private-message-model');

const app = express();
const port = 8001;

// Middleware to parse JSON in request body
app.use(express.json());

// Configurar CORS: Permite solicitudes desde localhost:3000 (frontend)
app.use(cors());

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
mongoose.connect(mongoUri);

// Function to validate required fields in the request body
function validateRequiredFields(req, requiredFields) {
  for (const field of requiredFields) {
    if (!(field in req.body)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

app.post('/adduser', async (req, res) => {
  try {
    // Check if required fields are present in the request body
    validateRequiredFields(req, ['username', 'password', 'confirmPassword']);

    const { username, password, confirmPassword, avatarOptions } = req.body;

    // Validación de longitud del username
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: "El nombre de usuario debe tener entre 3 y 20 caracteres." });
    }

    // Verificar si el nombre de usuario ya existe
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(400).json({ error: "El nombre de usuario ya existe" });
    }

    // Validación de longitud de password
    if (password.length < 6 || password.length > 50) {
      return res.status(400).json({ error: "La contraseña debe tener entre 6 y 50 caracteres." });
    }

    // Validación de complejidad del password (una letra mayuscula, una minuscula, un numero y un caracter especial)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: "La contraseña debe contener al menos una letra mayúscula, una minúscula, un número y un caracter especial" })
    }

    // confirmar si la contraseña es igual a la confirm
    if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).json({ error: "Las contraseñas no coinciden." });
    }

    // Encrypt the password before saving it
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = new User({
      username: req.body.username,
      password: hashedPassword,
      avatarOptions
    });

    await newUser.save();
    res.json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message }); 
  }});

// Actualizar el usuario
app.put('/users/:id', async (req, res) => {
  try {
    const { username, avatarOptions } = req.body;

    // Validación de longitud del username
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: "El nombre de usuariio debe tener entre 3 y 20 caracteres." });
    }

    // Verificar si el nombre de usuario ya existe
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser && existingUser._id.toString() !== req.params.id) {
      return res.status(400).json({ error: "El nombre de usuario ya existe." });
    }

    const updateUser = await User.findByIdAndUpdate(
      req.params.id, 
      { username, avatarOptions },
      { new: true } // Return the updated user
    );

    if(!updateUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(updateUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/addFriend', async (req, res) => {
  try {
    // Verificar que los campos requeridos estén presentes
    validateRequiredFields(req, ['username', 'friendUsername']);
    const { username, friendUsername } = req.body;
    
    // Verificar que el usuario no intente agregarse a sí mismo como amigo
    if (username === friendUsername) {
      return res.status(400).json({ error: "No puedes agregarte a ti mismo como amigo" });
    }
    
    // Buscar al usuario y al amigo
    const user = await User.findOne({ username });
    const friend = await User.findOne({ username: friendUsername });
    
    if (!friend) {
      return res.status(404).json({ error: "El usuario no fue encontrado" });
    }
    
    // Verificar que no sean ya amigos
    if (user.friends.includes(friend._id)) {
      return res.status(400).json({ error: "Ya tienes a este usuario como amigo." });
    }
    
    // Agregar la amistad en ambas direcciones
    user.friends.push(friend._id);
    friend.friends.push(user._id);
    
    // Guardar los cambios
    await user.save();
    await friend.save();
    
    // Responder con el mensaje de éxito
    res.status(200).json({ message: `Ahora ${username} y ${friendUsername} son amigos.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/listUsers', async (req, res) => {
  try {
    const users = await User.find({}, 'username friends avatarOptions'); // Return only the username and friends fields (password isn't included)
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/user/:username', async (req, res) => {
  try {
    // Busca al usuario por su 'username' y rellena la lista de amigos con solo el campo 'username'
    const user = await User.findOne({ username: req.params.username })
      .populate('friends', 'username avatarOptions');  // Poblar el campo 'friends' con solo los nombres de usuario
  
    // Si el usuario no se encuentra
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
  
    // Devuelve el usuario con la lista de amigos poblada
    res.status(200).json(user);
  } catch (error) {
    // Si hay un error, responde con un error 500
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para obtener la lista de usuarios que coinciden con el texto de búsqueda
app.get('/searchUsers', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Se requiere un término de búsqueda" });
    }

    // Buscar usuarios cuyo 'username' coincida parcialmente con el query
    const users = await User.find({ username: { $regex: query, $options: 'i' } }).limit(10);

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un amigo
app.post('/removeFriend', async (req, res) => {
  try {
    // Verificar que los campos requeridos estén presentes
    validateRequiredFields(req, ['username', 'friendUsername']);
    const { username, friendUsername } = req.body;

    // Verificar que el usuario no intente eliminarse a sí mismo
    if (username === friendUsername) {
      return res.status(400).json({ error: "No puedes eliminarte a ti mismo de la lista de amigos" });
    }

    // Buscar al usuario y al amigo
    const user = await User.findOne({ username });
    const friend = await User.findOne({ username: friendUsername });

    // Verificar que ambos usuarios existan
    if (!user || !friend) {
      return res.status(404).json({ error: "Usuario o amigo no encontrado" });
    }

    // Verificar que sean amigos
    if (!user.friends.includes(friend._id)) {
      return res.status(400).json({ error: "No son amigos" });
    }

    // Eliminar la amistad en ambas direcciones
    user.friends = user.friends.filter(friendId => !friendId.equals(friend._id));
    friend.friends = friend.friends.filter(friendId => !friendId.equals(user._id));

    // Guardar los cambios
    await user.save();
    await friend.save();

    // Responder con un mensaje de éxito
    res.status(200).json({ message: `${friendUsername} ha sido eliminado de tus amigos.` });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para aceptar una solicitud de amistad
app.post('/acceptFriendRequest', async (req, res) => {
  try {
    const { username, friendUsername } = req.body;

    const user = await User.findOne({ username });
    const friend = await User.findOne({ username: friendUsername });

    if (!user || !friend) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Verificar que la solicitud esté presente en la lista de solicitudes
    const requestIndex = user.friendRequests.indexOf(friend._id);
    if (requestIndex === -1) {
      return res.status(400).json({ error: "No hay solicitud pendiente de este usuario" });
    }

    // Mover el usuario de solicitudes a amigos en ambas direcciones
    user.friendRequests.splice(requestIndex, 1);
    friend.friendRequests.splice(friend.friendRequests.indexOf(user._id), 1);

    user.friends.push(friend._id);
    friend.friends.push(user._id);

    await user.save();
    await friend.save();

    res.status(200).json({ message: `¡Ahora son amigos! ${username} y ${friendUsername}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para rechazar una solicitud de amistad
app.post('/rejectFriendRequest', async (req, res) => {
  try {
    const { username, friendUsername } = req.body;

    const user = await User.findOne({ username });
    const friend = await User.findOne({ username: friendUsername });

    if (!user || !friend) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Verificar que la solicitud esté presente en la lista de solicitudes
    const requestIndex = user.friendRequests.indexOf(friend._id);
    if (requestIndex === -1) {
      return res.status(400).json({ error: "No hay solicitud pendiente de este usuario" });
    }

    // Eliminar la solicitud de ambas listas
    user.friendRequests.splice(requestIndex, 1);
    friend.friendRequests.splice(friend.friendRequests.indexOf(user._id), 1);

    await user.save();
    await friend.save();

    res.status(200).json({ message: `Solicitud de amistad rechazada de ${friendUsername}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para obtener las solicitudes de amistad de un usuario
app.get('/listRequests', async (req, res) => {
  const { username } = req.query;  // Usamos query params para recibir el 'username'

  if (!username) {
    return res.status(400).json({ error: 'Se requiere el nombre de usuario' });
  }

  try {
    // Buscar al usuario por su nombre de usuario
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Devolvemos las solicitudes de amistad pendientes
    res.status(200).json({ requests: user.friendRequests });
  } catch (error) {
    console.error('Error al obtener las solicitudes de amistad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para enviar una solicitud de amistad
app.post('/sendFriendRequest', async (req, res) => {
  try {
    // Verificar que los campos requeridos estén presentes
    validateRequiredFields(req, ['username', 'friendUsername']);
    const { username, friendUsername } = req.body;

    // Verificar que el usuario no intente enviarse una solicitud de amistad a sí mismo
    if (username === friendUsername) {
      return res.status(400).json({ error: "No puedes enviarte una solicitud de amistad a ti mismo" });
    }

    // Buscar al usuario y al amigo
    const user = await User.findOne({ username });
    const friend = await User.findOne({ username: friendUsername });

    // Verificar que ambos usuarios existan
    if (!user || !friend) {
      return res.status(404).json({ error: "Usuario o amigo no encontrado" });
    }

    // Verificar que no sean ya amigos
    if (user.friends.includes(friend._id)) {
      return res.status(400).json({ error: "Ya son amigos" });
    }

    // Verificar que no haya una solicitud de amistad pendiente
    if (friend.friendRequests.includes(user._id)) {
      return res.status(400).json({ error: "Ya has enviado una solicitud de amistad a este usuario" });
    }

    // Añadir el usuario a la lista de solicitudes de amistad del amigo
    friend.friendRequests.push(user._id);

    // Guardar los cambios
    await friend.save();

    // Responder con el mensaje de éxito
    res.status(200).json({ message: `Solicitud de amistad enviada a ${friendUsername}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/getUserId', async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    //console.log("Username:", username);
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ userId: user._id });
  } catch (error) {
    console.error("Error fetching user ID:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/getUsername', async (req, res) => {
  try {
    const { userId } = req.query;
    //console.log("User ID:", userId);
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await User.findById(userId, 'username'); // Fetch only the username field
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ username: user.username });
  } catch (error) {
    console.error("Error fetching username:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
})

const server = app.listen(port, () => {
  console.log(`User Service listening at http://localhost:${port}`);
});

// Endpoint para enviar un mensaje al chat global
app.post('/sendMessage', async (req, res) => {
  try {
    const { username, content } = req.body;

    if (!username || !content) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const newMessage = new Message({ content, sender: user._id });
    await newMessage.save();

    res.status(200).json({ message: 'Mensaje enviado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para obtener los últimos 50 mensajes del chat global
app.get('/getMessages', async (req, res) => {
  try {
    const messages = await Message.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('sender', 'username')
      .exec();

    res.json(messages.reverse()); // para mostrar de más antiguo a más reciente
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para enviar un mensaje privado
app.post('/sendPrivateMessage', async (req, res) => {
  try {
    const { senderUsername, receiverUsername, content } = req.body;

    if (!senderUsername || !receiverUsername || !content) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const sender = await User.findOne({ username: senderUsername });
    const receiver = await User.findOne({ username: receiverUsername });

    if (!sender || !receiver) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const newPrivateMessage = new PrivateMessage({
      content,
      sender: sender._id,
      receiver: receiver._id
    });
    await newPrivateMessage.save();

    res.status(200).json({ message: 'Mensaje privado enviado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para obtener los mensajes privados entre dos usuarios
app.get('/getPrivateMessages/:user1/:user2', async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    const messages = await PrivateMessage.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    })
    .sort({ createdAt: 1 }) // Ordenar por fecha de creación ascendente
    .populate('sender', 'username')
    .populate('receiver', 'username')
    .exec();

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listen for the 'close' event on the Express.js server
server.on('close', () => {
  // Close the Mongoose connection
  mongoose.connection.close();
});

module.exports = server