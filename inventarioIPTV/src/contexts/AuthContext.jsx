import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Estado para la carga inicial

  // Función para obtener los detalles del usuario desde el servidor
  const fetchUser = async () => {
    const token = localStorage.getItem('token'); // Recuperar token de localStorage
    if (!token) {
      setLoading(false); // No hay token, detener la carga
      return;
    }

    try {
      const response = await axios.get('http://localhost:3000/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`, // Incluye el token en el encabezado
        },
      });
      setUser(response.data); // Establecer los datos del usuario
    } catch (error) {
      setUser(null); // Si hay error, asegurarse de que no hay usuario
    } finally {
      setLoading(false); // Detener la carga
    }
  };

  useEffect(() => {
    fetchUser(); // Obtener el usuario cuando el componente se monte
  }, []);

  return (
    <AuthContext.Provider value={{ user, fetchUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
