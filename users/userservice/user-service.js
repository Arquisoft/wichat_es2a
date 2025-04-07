const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./user-model');
const cors = require('cors');

const app = express();
const port = 8001;

// Middleware to parse JSON in request body
app.use(express.json());

// Configurar CORS: Permite solicitudes desde localhost:3000 (frontend)
app.use(cors({
  origin: 'http://localhost:3000',
}));

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
        validateRequiredFields(req, ['username', 'password']);

        // Verificar si el nombre de usuario ya existe
        const existingUser = await User.findOne({ username:req.body.username });
        if (existingUser) {
            return res.status(400).json({ error: "El nombre de usuario ya existe." });
        }
        
        // Encrypt the password before saving it
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const newUser = new User({
            username: req.body.username,
            password: hashedPassword,
        });

        await newUser.save();
        res.json(newUser);
    } catch (error) {
        res.status(400).json({ error: error.message }); 
    }});

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
    
        // Verificar que ambos usuarios existan
        if (!user || !friend) {
          return res.status(404).json({ error: "Usuario o amigo no encontrado" });
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
        const users = await User.find({}, 'username friends'); // Return only the username and friends fields (password isn't included)
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  });

  app.get('/user/:username', async (req, res) => {
    try {
      // Busca al usuario por su 'username' y rellena la lista de amigos con solo el campo 'username'
      const user = await User.findOne({ username: req.params.username })
        .populate('friends', 'username');  // Poblar el campo 'friends' con solo los nombres de usuario
  
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

const server = app.listen(port, () => {
  console.log(`User Service listening at http://localhost:${port}`);
});

// Listen for the 'close' event on the Express.js server
server.on('close', () => {
    // Close the Mongoose connection
    mongoose.connection.close();
  });

module.exports = server