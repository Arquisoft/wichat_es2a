import React, { useState } from 'react';
import AddUser from './components/AddUser';
import Login from './components/Login';
import CssBaseline from '@mui/material/CssBaseline';
// import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Nav from "./components/Nav"
import defaultTheme from "./components/config/default-Theme.json"
import { ThemeProvider, createTheme } from "@mui/material/styles";
import GamePanel from "./components/GamePanel";

const theme = createTheme(defaultTheme);

function App() {
  const [showLogin, setShowLogin] = useState(true);

  const handleToggleView = () => {
    setShowLogin(!showLogin);
  };

  return (
    // <ThemeProvider theme={theme}>
    //   <CssBaseline />
    //   <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
    //     <Nav />
    //     <Typography component="h1" variant="h5" align="center" sx={{ marginTop: 2 }}>
    //       Welcome to the 2025 edition of the Software Architecture course
    //     </Typography>
    //     {showLogin ? <Login /> : <AddUser />}
    //     <Typography component="div" align="center" sx={{ marginTop: 2 }}>
    //       {showLogin ? (
    //         <Link name="gotoregister" component="button" variant="body2" onClick={handleToggleView}>
    //           Don't have an account? Register here.
    //         </Link>
    //       ) : (
    //         <Link component="button" variant="body2" onClick={handleToggleView}>
    //           Already have an account? Login here.
    //         </Link>
    //       )}
    //     </Typography>
    //   </Box>
    // </ThemeProvider>
    <GamePanel/>
  );
}

export default App;
