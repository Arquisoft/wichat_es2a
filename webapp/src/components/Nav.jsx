import React, { useState } from 'react';
import {
    AppBar, Box, Toolbar, IconButton, Typography, Menu, Container, Button,
    MenuItem, Drawer, List, ListItem, ListItemButton, ListItemText
} from '@mui/material';
import {
    Menu as MenuIcon, AccountCircle as AccountCircleIcon, Close as CloseIcon, Language as LanguageIcon
} from '@mui/icons-material';
import { ReactComponent as CustomIcon } from '../media/logoS.svg';
import { useTheme } from '@mui/material/styles';
import defaultTheme from "./config/default-Theme.json";
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import "../i18n";

const pages = [
    { code: 'home', link: '/home', name: 'Home' },
    { code: 'contact', link: '/contact', name: 'Contacto' },
    { code: 'history', link: '/history', name: 'Historial' } // Added Historial button
];

const languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' }
];

const MenuDrawer = ({ open, onClose, t }) => (
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
                    <ListItem key={page.code} disablePadding>
                        <ListItemButton component={Link} to={page.link} sx={{ textAlign: 'left' }}>
                            <ListItemText primary={t(`nav.${page.code}`)} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    </Drawer>
);

const UserMenu = ({ anchorEl, open, onClose, onLogout, navigate, t }) => (
    <Menu
        sx={{ mt: '45px' }}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={open}
        onClose={onClose}
    >
        {[
            { code: 'profile', route: '/profile' },
            { code: 'settings', route: '/settings' },
            { code: 'logout', action: onLogout }
        ].map((item) => (
            <MenuItem key={item.code} onClick={() => {
                if (item.route) {
                    navigate(item.route);
                } else if (item.action) {
                    item.action();
                }
                onClose();
            }}>

                <Typography textAlign="center">{t(`userMenu.${item.code}`)}</Typography>
            </MenuItem>
        ))}
    </Menu>
);

const Nav = () => {
    const theme = useTheme();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [anchorElLang, setAnchorElLang] = useState(null);
    const navigate = useNavigate(); // Hook de navegación
    const { t, i18n } = useTranslation();

    // Función para cerrar sesión
    const handleLogout = () => {
        // Eliminar el usuario del almacenamiento local
        localStorage.removeItem('user');
        // Redirigir al usuario a la página de inicio
        navigate('/login');
    };

    // Función para cambiar el idioma de la apliación
    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        setAnchorElLang(null); // Cierra el menú después de seleccionar un idioma
    };

    return (
        <AppBar position="static" sx={{ background: theme.palette.primary.main }}>
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
                                {t(`nav.${page.code}`)}
                            </Button>
                        ))}
                    </Box>

                    {/* Language Selector */}
                    <Box sx={{ flexGrow: 0, mr: 2 }}>
                        <IconButton size="large" onClick={(e) => setAnchorElLang(e.currentTarget)} color="inherit">
                            <LanguageIcon />
                        </IconButton>
                        <Menu
                            anchorEl={anchorElLang}
                            open={Boolean(anchorElLang)}
                            onClose={() => setAnchorElLang(null)}
                        >
                            {languages.map((lang) => (
                                <MenuItem key={lang.code} onClick={() => changeLanguage(lang.code)}>
                                    {lang.label}
                                </MenuItem>
                            ))}
                        </Menu>
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
            <MenuDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} t={t} />

            {/* User Dropdown Menu */}
            <UserMenu
                anchorEl={anchorElUser}
                open={Boolean(anchorElUser)}
                onClose={() => setAnchorElUser(null)}
                onLogout={handleLogout} // Pasa la función de cerrar sesión
                navigate={navigate} // Pasa la función de navegación
                t={t}
            />
        </AppBar>
    );
};

export default Nav;
