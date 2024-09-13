import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ element, requiredRoles }) => {
  const { user, loading } = useAuth();

  // Mientras el estado de autenticación está cargando, no renderices ni redirijas
  if (loading) {
    return <div>Cargando...</div>; // Puedes cambiar esto por un spinner o un mensaje de carga
  }

  // Si no hay usuario autenticado, redirige al login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Verifica si el usuario tiene el rol necesario
  if (requiredRoles && !requiredRoles.includes(user.rol)) {
    return <Navigate to="/" />;
  }

  // Renderiza el componente si se cumplen las condiciones
  return element;
};

export default PrivateRoute;
