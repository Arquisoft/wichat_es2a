const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./user-model')

const app = express();
const port = 8001;

// Middleware to parse JSON in request body
app.use(express.json());

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

        const { username, password, confirmPassword } = req.body;

        // Validación de longitud del username
        if(username.length < 3 || username.length > 20){
          return res.status(400).json({ error: "El nombre de usuariio debe tener entre 3 y 20 caracteres."});
        }

        // Verificar si el nombre de usuario ya existe
        const existingUser = await User.findOne({ username:req.body.username });
        if (existingUser) {
            return res.status(400).json({ error: "El nombre de usuario ya existe." });
        }

        // Validación de longitud de password
        if(password.length < 6 || password.length > 50){
          return res.status(400).json({ error: "La contraseña debe tener entre 6 y 50 caracteres."});
        }

        // Validación de complejidad del password (una letra mayuscula, una minuscula, un numero y un caracter especial)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/;
        if(! passwordRegex.test(password)){
          return res.status(400).json({ error: "La contraseña debe contener al menos una letra mayúscula, una minúscula, un número y un caracter especial"})
        }

        // confirmar si la contraseña es igual a la confirm
        if(req.body.password !== req.body.confirmPassword){
          return res.status(400).json({ error: "Las contraseñas no coinciden." });
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

app.post('/addFriend', async(req,res) => {
  try{
    validateRequiredFields(req, ['username','friendUsername']);
    const { username, friendUsername } = req.body;

    if(username == friendUsername){
      return res.status(400).json({error:"No puedes agregarte a ti mismo como amigo"});
    }

    const user = await User.findOne({ username: username});
    const friend = await User.findOne({username: friendUsername});

    if (!friend) {
      return res.status(404).json({ error: "El usuario no fue encontrado" });
    }

    if (user.friends.includes(friend._id)) {
      return res.status(400).json({ error: "Ya tienes a este usuario como amigo." });
    }

    user.friends.push(friend._id);
    friend.friends.push(user._id);

    await user.save();
    await friend.save();

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
      const user = await User.findOne({ username: req.params.username }, 'username friends'); // Return only the username and friends fields (password isn't included)
      if (!user) {
          return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json(user);
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
      console.log("Username:", username);
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
        console.log("User ID:", userId);
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

const server = app.listen(port, () => {
  console.log(`User Service listening at http://localhost:${port}`);
});

// Listen for the 'close' event on the Express.js server
server.on('close', () => {
    // Close the Mongoose connection
    mongoose.connection.close();
  });

module.exports = server