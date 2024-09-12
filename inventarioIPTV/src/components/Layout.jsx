import React from 'react';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-4 bg-gray-800 flex items-center">
        <img 
          src="/Revify.png" 
          alt="Revify Logo" 
          className="h-12 mr-4" 
        />
        <nav>
          <Link to="/" className="mr-4 hover:text-gray-300">Inicio</Link>
          <Link to="/add" className="mr-4 hover:text-gray-300">Agregar</Link>
          <Link to="/update" className="mr-4 hover:text-gray-300">Actualizar</Link>
          <Link to="/delete" className="mr-4 hover:text-gray-300">Eliminar</Link>
          <Link to="/upload" className="mr-4 hover:text-gray-300">Cargar</Link>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
