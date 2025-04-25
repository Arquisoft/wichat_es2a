import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { ThemeProvider, createTheme } from "@mui/material/styles";

import Nav from "./components/Nav";
import AddUser from './components/AddUser';
import Login from './components/Login';
import GamePanel from "./components/GamePanel";
import Home from "./components/Home";
import defaultTheme from "./components/config/default-Theme.json";
import ProtectedRoute from './components/ProtectedRoute';   // Rutas protegidas
import GameHistoryUI from './components/GameHistoryUI';
import Contact from './components/Contact';
import Profile from './components/Profile';
import MathGame from './components/MathGame';
import Configuration from './components/Configuration';
import UserGroups from './components/UserGroups';
import GroupDetails from './components/GroupDetails';
import GameHistoryUIGroup from './components/GameHistoryUIGroup';
import Countdown from './components/Countdown'; // Importar el componente Countdown
import Friends from './components/Friends'; // Importar el componente Friends
import EditProfile from './components/EditProfile';

const theme = createTheme(defaultTheme);


function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router> {/* Asegurar que Routes esté dentro de BrowserRouter */}
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
          <Nav />
          <Routes> {/* Definimos las rutas */}
            <Route path="/login" element={<Login />} />
            <Route path="/adduser" element={<AddUser />} />
            <Route path="/contact" element={<Contact />} />

            {/* Rutas protegidas: solo accesibles si el usuario está autenticado*/}
            <Route element={<ProtectedRoute />}>
              <Route path="/game" element={<GamePanel />} />
              <Route path="/home" element={<Home />} />
              <Route path="/history" element={<GameHistoryUI userId={localStorage.getItem('user')} />} />
              <Route path="/gamehistory/:username" element={<GameHistoryUIGroup />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/configuration" element={<Configuration />} />
              <Route path="/mathgame" element={<MathGame />} />
              <Route path="/friends" element={<Friends userId={localStorage.getItem('user')} />} />
              <Route path="/groups" element={<UserGroups />} />
              <Route path="/groups/:groupName" element={<GroupDetails />} />
              <Route path="/edit-profile" element={<EditProfile />} />
            </Route>

            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/login" replace/>} /> {/* Redirigir si la ruta no existe */}
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  
  );
}

export default App;
