import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';


const ClientesTelefonos = () => {
  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ telefono: '', cliente: '', proyecto: '' });
  const [editingClient, setEditingClient] = useState(null); // Estado para el cliente en edición
  const [editForm, setEditForm] = useState({
    CLIENTE: '',
    PROYECTO: '',
    LOCAL: '',
    CONTRATO: '',
  });

  const itemsPerPage = 10; // Número de elementos por página

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:3000/clientes-telefonos');
        setClientes(response.data); // Almacena todos los datos en el estado
        setFilteredClientes(response.data); // Inicialmente no se filtra
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los datos');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtro los datos en función de los filtros actuales
  useEffect(() => {
    const filtered = clientes.filter((cliente) => {
      return (
        (cliente.TELEFONO && cliente.TELEFONO.toString().toLowerCase().includes(filters.telefono.toLowerCase())) &&
        (cliente.CLIENTE && cliente.CLIENTE.toString().toLowerCase().includes(filters.cliente.toLowerCase())) &&
        (cliente.PROYECTO && cliente.PROYECTO.toString().toLowerCase().includes(filters.proyecto.toLowerCase()))
      );
    });
    setFilteredClientes(filtered);
    setCurrentPage(1); // Reiniciar a la primera página después de filtrar
  }, [filters, clientes]);

  // Calcular los datos para mostrar en la página actual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClientes = filteredClientes.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= Math.ceil(filteredClientes.length / itemsPerPage)) {
      setCurrentPage(newPage);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditClick = async (telefono) => {
    try {
      const response = await axios.get(`http://localhost:3000/clientes-telefonos/${telefono}`);
      setEditingClient(telefono); // Guardar el teléfono del cliente que se está editando
      const data = response.data;
  
      // Asegúrate de que los valores no sean null, usa cadena vacía en su lugar
      setEditForm({
        CLIENTE: data.CLIENTE || '',
        PROYECTO: data.PROYECTO || '',
        LOCAL: data.LOCAL || '',
        CONTRATO: data.CONTRATO || '',
        TELEFONO: data.TELEFONO || ''
      });
    } catch (err) {
      setError('Error al cargar los datos del cliente');
    }
  };
  

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3000/clientes-telefonos/${editingClient}`, editForm);
      // Actualizar la lista de clientes tras la edición
      const updatedClientes = clientes.map((cliente) =>
        cliente.TELEFONO === editingClient ? { ...cliente, ...editForm } : cliente
      );
      setClientes(updatedClientes);
      setEditingClient(null); // Cerrar el formulario de edición
    } catch (err) {
      setError('Error al actualizar el cliente');
    }
  };

  const handleEditFormChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return <div className="text-white">Cargando...</div>;
  }

  if (error) {
    return <div className="text-red-400">{error}</div>;
  }

  const handleDownload = () => {
    const ws = XLSX.utils.json_to_sheet(filteredClientes);  // Convertir los datos a una hoja de cálculo
    const wb = XLSX.utils.book_new();  // Crear un nuevo libro de trabajo
    XLSX.utils.book_append_sheet(wb, ws, "Telefonos");  // Agregar la hoja de trabajo
    XLSX.writeFile(wb, "telefonos.xlsx");  // Descargar el archivo
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-4">Clientes y Teléfonos</h1>

      {/* Formulario de Filtros */}
     
      <form className="mb-6 flex space-x-4">
      <button
                onClick={handleDownload}
                className="p-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition-transform duration-200 transform hover:scale-105 block"
            >
                Descargar XLSX
            </button>
        <input
          type="text"
          name="telefono"
          value={filters.telefono}
          onChange={handleFilterChange}
          placeholder="Filtrar por Teléfono"
          className="p-2 rounded bg-gray-800 text-white border border-gray-700"
        />
        <input
          type="text"
          name="cliente"
          value={filters.cliente}
          onChange={handleFilterChange}
          placeholder="Filtrar por Cliente"
          className="p-2 rounded bg-gray-800 text-white border border-gray-700"
        />
        <input
          type="text"
          name="proyecto"
          value={filters.proyecto}
          onChange={handleFilterChange}
          placeholder="Filtrar por Proyecto"
          className="p-2 rounded bg-gray-800 text-white border border-gray-700"
        />
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-700 text-left">
              <th className="p-3">Cliente</th>
              <th className="p-3">Teléfono</th>
              <th className="p-3">Proyecto</th>
              <th className="p-3">Local</th>
              <th className="p-3">Contrato</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedClientes.map((cliente, index) => (
              <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
                <td className="p-3">{cliente.CLIENTE}</td>
                <td className="p-3">{cliente.TELEFONO}</td>
                <td className="p-3">{cliente.PROYECTO}</td>
                <td className="p-3">{cliente.LOCAL}</td>
                <td className="p-3">{cliente.CONTRATO}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleEditClick(cliente.TELEFONO)}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded"
                  >
                    Modificar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Controles de Paginación */}
      <div className="mt-6 flex justify-between items-center">
        <span>Página {currentPage} de {Math.ceil(filteredClientes.length / itemsPerPage)}</span>
        <div>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            className="bg-gray-700 px-4 py-2 rounded-l-lg hover:bg-gray-600"
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            className="bg-gray-700 px-4 py-2 rounded-r-lg hover:bg-gray-600"
            disabled={currentPage === Math.ceil(filteredClientes.length / itemsPerPage)}
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* Formulario de Edición */}
      {editingClient && (
        <div className="mt-6 p-4 bg-gray-800 rounded shadow-lg">
          <h2 className="text-xl font-bold mb-4">Modificar Teléfono {editForm.TELEFONO}</h2>
          <form onSubmit={handleEditSubmit}>
            <div className="mb-4">
              <label className="block text-gray-300">Cliente</label>
              <input
                type="text"
                name="CLIENTE"
                value={editForm.CLIENTE || ''}
                onChange={handleEditFormChange}
                className="p-2 rounded bg-gray-700 text-white w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-300">Proyecto</label>
              <input
                type="text"
                name="PROYECTO"
                value={editForm.PROYECTO || ''}
                onChange={handleEditFormChange}
                className="p-2 rounded bg-gray-700 text-white w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-300">Local</label>
              <input
                type="text"
                name="LOCAL"
                value={editForm.LOCAL || ''}
                onChange={handleEditFormChange}
                className="p-2 rounded bg-gray-700 text-white w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-300">Contrato</label>
              <input
                type="text"
                name="CONTRATO"
                value={editForm.CONTRATO || ''}
                onChange={handleEditFormChange}
                className="p-2 rounded bg-gray-700 text-white w-full"
              />
            </div>
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded">
              Guardar Cambios
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ClientesTelefonos;
