// este script es para eliminar todos los usuarios de la base de datos
// NO SE DEBERÍA DE TENER, es solo para pruebas
const mongoose = require('mongoose');
const User = require('./user-model');

mongoose.connect('mongodb://localhost:27017/userdb', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() =>{
        console.log('Connected to MongoDB');

        // Eliminar todos los usuarios
        return User.deleteMany();
    })
    .then(() =>{
        console.log('Todos los usuarios han sido eliminados');
        mongoose.connection.close();
    })
    .catch((error) =>{
        console.error('Error:', error);
        mongoose.connection.close();
    });