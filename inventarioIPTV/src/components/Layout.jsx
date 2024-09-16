import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // Estado para almacenar la información del usuario
  const [loading, setLoading] = useState(true); // Estado para manejar la carga

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('token'); // Eliminar el token de autenticación
    navigate('/login'); // Redirigir a la página de inicio de sesión
    window.location.reload(); // Recargar la página para aplicar los cambios
  };

  // Función para obtener la información del usuario
  const fetchUserData = async () => {
    try {
      const response = await fetch('http://172.16.2.103:3000/auth/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Pasar el token en la cabecera
        },
      });
      const data = await response.json();
      setUser(data); // Guardar los datos del usuario en el estado
      setLoading(false); // Finalizar el estado de carga
    } catch (error) {
      console.error('Error al obtener la información del usuario:', error);
      setLoading(false); // Asegurarse de detener el estado de carga en caso de error
    }
  };

  useEffect(() => {
    fetchUserData(); // Llamar a la función al montar el componente
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Mostrar un mensaje de carga mientras se obtienen los datos
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-4 bg-gray-800 flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src="/Revify.png" 
            alt="Revify Logo" 
            className="h-12 mr-4" 
          />
          
          {/* Distinción por roles basada en la respuesta del servidor */}
          {user?.rol === 'admin' ? (
            <nav>
              <Link to="/" className="mr-4 hover:text-gray-300">Inventario</Link>
              <Link to="/add" className="mr-4 hover:text-gray-300">Agregar</Link>
              <Link to="/update" className="mr-4 hover:text-gray-300">Actualizar</Link>
              <Link to="/delete" className="mr-4 hover:text-gray-300">Eliminar</Link>
              <Link to="/upload" className="mr-4 hover:text-gray-300">Cargar</Link>
              <Link to="/telefonos" className="mr-4 hover:text-gray-300">Telefonos</Link>

            </nav>
          ) : user?.rol === 'soporte' || user?.rol === 'contabilidad' ? (
            <nav>
              <Link to="/" className="mr-4 hover:text-gray-300">Inventario</Link>
              <Link to="/telefonos" className="mr-4 hover:text-gray-300">Telefonos</Link>
            </nav>
          ) : (
            <nav>
              <Link to="/" className="mr-4 hover:text-gray-300">Inventario</Link>
              <Link to="/telefonos" className="mr-4 hover:text-gray-300">Telefonos</Link>

            </nav>
          )}
        </div>

        {/* Botón de Cerrar Sesión */}
        <button 
          onClick={handleLogout} 
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Cerrar sesión
        </button>
      </header>

      <main>{children}</main>
    </div>
  );
};

export default Layout;
