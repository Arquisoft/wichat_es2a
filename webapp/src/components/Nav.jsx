import React, { useState } from 'react';
import {
    AppBar, Box, Toolbar, IconButton, Typography, Menu, Container, Button,
    MenuItem, Drawer, List, ListItem, ListItemButton, ListItemText
} from '@mui/material';
import {
    Menu as MenuIcon, AccountCircle as AccountCircleIcon, Close as CloseIcon
} from '@mui/icons-material';
import { ReactComponent as CustomIcon } from '../media/logoS.svg';
import { useTheme } from '@mui/material/styles';
import defaultTheme from "./config/default-Theme.json";
import { useNavigate, Link } from 'react-router-dom';

const pages = [
    { code: 'home', link: '/home', name: 'Home' },
    { code: 'history', link: '/history', name: 'Historial' }, // Added Historial button
    { code: 'friends', link: '/friends', name: 'Amigos' }, // Added Friends button
    { code: 'groups', link: '/groups', name: 'Grupos' },
    { code: 'mathgame', link: '/mathgame', name: 'Juego Matemático' },
    { code: 'contact', link: '/contact', name: 'Contacto' }
];

const MenuDrawer = ({ open, onClose }) => (
    <Drawer
        variant="temporary"
        anchor="left"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 }
        }}
    >
        <Box onClick={onClose} sx={{ textAlign: 'center', p: 2 }}>
            <CustomIcon style={{ height: '40px', width: 'auto' }} />
            <IconButton color="inherit">
                <CloseIcon />
            </IconButton>
            <List>
                {pages.map((page) => (
                    <ListItem key={page.name} disablePadding>
                        <ListItemButton sx={{ textAlign: 'left' }}>
                            <ListItemText primary={page.name} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    </Drawer>
);

const UserMenu = ({ anchorEl, open, onClose, onLogout, navigate }) => (
    <Menu
        sx={{ mt: '45px' }}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={open}
        onClose={onClose}
    >
        {["Perfil", "Configuración", "Cerrar Sesión"].map((text, index) => (
            <MenuItem key={text} onClick={()=>{
              if(index===0){ // Perfil
                navigate('/profile');
              } 
              else if(index===1){ // Configuración
                navigate('/configuration');
              }
              else if(index===2){ // Cerrar Sesión
                onLogout();
              }
              onClose(); // Cerrar el menú
            }}>

                <Typography textAlign="center">{text}</Typography>
            </MenuItem>
        ))}
    </Menu>
);

const Nav = () => {
    const theme = useTheme();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorElUser, setAnchorElUser] = useState(null);
    const navigate = useNavigate(); // Hook de navegación

    // Función para cerrar sesión
    const handleLogout = () => {
        // Eliminar el usuario del almacenamiento local
        localStorage.removeItem('user');
        // Redirigir al usuario a la página de inicio
        navigate('/login');
    };

    return (
            <AppBar position="static" sx={{background: theme.palette.primary.main}}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        {/* Logo */}
                        <CustomIcon />

                        {/* Mobile Menu Button */}
                        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                            <IconButton size="large" onClick={() => setMobileOpen(true)} color="inherit">
                                <MenuIcon />
                            </IconButton>
                        </Box>

                        {/* Page Links */}
                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                            {pages.map((page) => (
                                <Button 
                                    key={page.name} 
                                    component={Link}
                                    to={page.link}
                                    sx={{ my: 2, color: defaultTheme.palette.primary.contrastText }}>
                                    {page.name}
                                </Button>
                            ))}
                        </Box>

                        {/* Icons */}
                        <Box sx={{ flexGrow: 0 }}>
                            <IconButton size="large" onClick={(e) => setAnchorElUser(e.currentTarget)} color="inherit">
                                <AccountCircleIcon />
                            </IconButton>
                        </Box>
                    </Toolbar>
                </Container>

                {/* Drawer for Mobile Menu */}
                <MenuDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />

            {/* User Dropdown Menu */}
            <UserMenu 
                anchorEl={anchorElUser} 
                open={Boolean(anchorElUser)} 
                onClose={() => setAnchorElUser(null)} 
                onLogout={handleLogout} // Pasa la función de cerrar sesión
                navigate={navigate} // Pasa la función de navegación
            />
        </AppBar>
    );
};

export default Nav;
