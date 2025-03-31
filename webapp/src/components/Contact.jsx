import React from 'react';
import { Container, Grid, Typography, Card, CardContent, Avatar, Link, Box } from '@mui/material';
import { Email, GitHub } from '@mui/icons-material';
import defaultTheme from "./config/default-Theme.json";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import imageW from '../media/women.jpg';
import imageM from '../media/men.jpg';
import {useTranslation} from 'react-i18next';
import "../i18n";

const teamMembers = [
    { name: 'Natalia Blanco Agudín', role: 'Desarrolladora Fronted', email: 'UO295340@uniovi.com', github: 'https://github.com/NataliaBlancoAgudin', avatar: imageW, descKey: 'contact.team.natalia' },
    { name: 'David Covián Gómez', role: 'Desarrollador Backend', email: 'UO295168@uniovi.com', github: 'https://github.com/DavidCG-27', avatar: imageM, descKey: 'contact.team.david' },
    { name: 'Darío Cristóbal González', role: 'Diseñador Backend', email: 'UO294401@uniovi.com', github: 'https://github.com/daariio92', avatar: imageM, descKey: 'contact.team.dario' },
    { name: 'Hugo Fernández Rogríguez', role: 'Diseñador LLM', email: 'UO289157@uniovi.com', github: 'https://github.com/hugo-fdez', avatar: imageM, descKey: 'contact.team.hugoF' },
    { name: 'Marcos Llanos Vega', role: 'Diseñador Frontend', email: 'UO218982@uniovi.com', github: 'https://github.com/softwaremarcos', avatar: imageM, descKey: 'contact.team.marcos' },
    { name: 'Hugo Prendes Menéndez', role: 'Diseñador LLM', email: 'UO288294@uniovi.com', github: 'https://github.com/prendess', avatar: imageM, descKey: 'contact.team.hugoP' },
];

const theme = createTheme(defaultTheme);

const Contact = () => {
    const { t } = useTranslation();
    return (
        <ThemeProvider theme={theme}>
            <Container
                maxWidth="md"
                sx={{
                    mt: 4,
                    textAlign: 'center',
                    minHeight: '100vh', // Asegura que el contenedor ocupe toda la altura de la pantalla
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    pb: 6  // Espacio inferior para evitar que el contenido se superponga al pie de página
                }}
            >
                <Typography variant="h4" gutterBottom color="primary">
                    {t('contact.title')}
                </Typography>
                <Typography variant="body1" paragraph>
                    {t('contact.description')}
                </Typography>

                <Typography variant="h5" gutterBottom color="primary">
                    {t('contact.subtitle')}
                </Typography>

                <Grid container spacing={1} justifyContent="center" sx={{ flexGrow: 1, width: '100%', maxWidth: 1000 }}>
                    {teamMembers.map((member, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card sx={{
                                borderRadius: 2,
                                boxShadow: 3,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                p: 2,
                                minHeight: 200 // Asegura que todas las tarjetas tengan la misma altura
                            }}>
                                {/* Avatar con borde redondeado */}
                                <Avatar sx={{ width: 56, height: 56, backgroundColor: 'transparent', borderRadius: '50%' }}>
                                    <img src={member.avatar} style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '50%',
                                        objectFit: 'cover'
                                    }} />
                                </Avatar>

                                <CardContent sx={{ textAlign: 'center', flexGrow: 1 }}>
                                    <Typography variant="h6" sx={{ mt: 1 }}>{member.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">{t(member.descKey)}</Typography>

                                    <Box sx={{ mt: 1 }}>
                                        {/* Enlace a correo electrónico */}
                                        <Link href={member.email} sx={{ display: 'block' }}>
                                            <Email fontSize="small" /> {member.email}
                                        </Link>

                                        {/* Enlace a GitHub */}
                                        <Link href={member.github} target="_blank" sx={{ display: 'block', mt: 1 }}>
                                            <GitHub fontSize="small" /> GitHub
                                        </Link>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </ThemeProvider>

    );
};

export default Contact;

