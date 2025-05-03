import React from 'react';
import { Container, Grid, Typography, Card, CardContent, Avatar, Link, Box } from '@mui/material';
import { Email, GitHub } from '@mui/icons-material';
import defaultTheme from "./config/default-Theme.json";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import imageW from '../media/women.jpg';
import imageM from '../media/men.jpg';

const teamMembers = [
    { name: 'Natalia Blanco Agudín', role: 'Desarrolladora Frontend', email: 'UO295340@uniovi.com', github: 'https://github.com/NataliaBlancoAgudin', avatar: imageW },
    { name: 'Marcos Llanos Vega', role: 'Desarrollador Frontend', email: 'UO218982@uniovi.com', github: 'https://github.com/softwaremarcos', avatar: imageM },
    { name: 'David Covián Gómez', role: 'Desarrollador Backend', email: 'UO295168@uniovi.com', github: 'https://github.com/DavidCG-27', avatar: imageM },
    { name: 'Darío Cristóbal González', role: 'Diseñador Backend', email: 'UO294401@uniovi.com', github: 'https://github.com/daariio92', avatar: imageM },
    { name: 'Hugo Fernández Rogríguez', role: 'Diseñador LLM y despliegue', email: 'UO289157@uniovi.com', github: 'https://github.com/hugo-fdez', avatar: imageM },
    { name: 'Hugo Prendes Menéndez', role: 'Diseñador LLM', email: 'UO288294@uniovi.com', github: 'https://github.com/prendess', avatar: imageM },
];

const theme = createTheme(defaultTheme);

const Contact = () => {
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
                    Sobre Nosotros
                </Typography>
                <Typography variant="body1" paragraph>
                    Somos un equipo apasionado por la tecnología, desarrollando aplicaciones innovadoras y soluciones digitales.
                </Typography>

                <Typography variant="h5" gutterBottom color="primary">
                    Nuestro Equipo
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
                                    <Typography variant="body2" color="text.secondary">{member.role}</Typography>

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

