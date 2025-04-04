import React from 'react';
import { Box, Grid } from '@mui/material';
import defaultTheme from "./components/config/default-Theme.json";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import GamePanel from './components/GamePanel';
import ChatPanel from './components/ChatPanel';
import Nav from './components/Nav';

const theme = createTheme(defaultTheme);

const Game = () => {

    return (
        <ThemeProvider theme={theme}>
          <Box>
        <Grid container>
            <Grid item xs={8}>
              <GamePanel />
            </Grid>
            <Grid item xs={4}>
              <ChatPanel />
            </Grid>
            </Grid>
        </Box>
        </ThemeProvider>
    );
};

export default Game;