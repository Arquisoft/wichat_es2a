// src/components/Home.jsx
import React from 'react';
import { Container, Grid, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import image from '../media/logoWiChat.svg';
import {useTranslation} from 'react-i18next';
import "../i18n";

const Home = () => {
  const { t } = useTranslation();

  return (
    <Container component="main" maxWidth="xl" sx={{ marginTop: 4, padding: { xs: 2, sm: 4 } }}>
      <Grid container spacing={4}>
        {/* Left column: Welcome message */}
        <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }} gutterBottom>
            WICHAT
          </Typography>
          <Typography variant="h6" paragraph sx={{ color: 'text.secondary', fontWeight: 300, lineHeight: 1.5 }}>
            {t('home.description')}
          </Typography>

          <Box>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/game"
              sx={{
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 600,
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'secondary.main',
                  transform: 'scale(1.05)',
                },
              }}
            >
              {t('home.playButton')}
            </Button>
          </Box>
        </Grid>

        {/* Right column: Image */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <img
            src={image}
            alt="Home"
            style={{
              width: '100%',
              height: '100%',
              maxWidth: '450px',
              objectFit: 'cover',
            }}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;
