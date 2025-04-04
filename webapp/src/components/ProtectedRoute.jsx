import React from 'react';
import {Navigate, Outlet} from 'react-router-dom';

const ProtectedRoute = () => {
    // Comprobamos si el usuario está autenticado
    const user = JSON.parse(localStorage.getItem('user'));

    // Si el usuario o el token no existen, redirigimos al usuario a la página de login
    if(!user || !user.token) {
        return <Navigate to="/login" replace />;
    }

    // Si el usuario y el token existen, permitimos el acceso a la ruta
    return <Outlet />;
};

export default ProtectedRoute;