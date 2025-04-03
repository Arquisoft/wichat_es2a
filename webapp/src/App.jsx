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
import Countdown from './components/Countdown'; // Importar el componente Countdown

const theme = createTheme(defaultTheme);


function App() {
  return (
    // <ThemeProvider theme={theme}>
    //   <CssBaseline />
    //   <Router> {/* Asegurar que Routes esté dentro de BrowserRouter */}
    //     <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
    //       <Nav />
    //       <Routes> {/* Definimos las rutas */}
    //         <Route path="/login" element={<Login />} />
    //         <Route path="/adduser" element={<AddUser />} />
    //         <Route path="/contact" element={<Contact />} />

    //         {/* Rutas protegidas: solo accesibles si el usuario está autenticado*/}
    //         <Route element={<ProtectedRoute />}>
    //           <Route path="/game" element={<GamePanel />} />
    //           <Route path="/home" element={<Home />} />
    //           <Route path="/history" element={<GameHistoryUI userId={localStorage.getItem('user')} />} />
    //           <Route path="/profile" element={<Profile />} />
    //         </Route>

    //         {/* Redirección por defecto */}
    //         <Route path="*" element={<Navigate to="/login" replace/>} /> {/* Redirigir si la ruta no existe */}
    //       </Routes>
    //     </Box>
    //   </Router>
    // </ThemeProvider>
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Countdown />
      </Box>
    </ThemeProvider>
   
  );
}

export default App;
