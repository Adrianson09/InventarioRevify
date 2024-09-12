import { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const InventarioList = () => {
    const [inventario, setInventario] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterInput, setFilterInput] = useState("");

    useEffect(() => {
        const fetchInventario = async () => {
            try {
                const response = await axios.get('http://localhost:3000/inventario');
                setInventario(response.data);
            } catch (err) {
                setError('Error al obtener los datos del inventario. ' + err);
            } finally {
                setLoading(false);
            }
        };

        fetchInventario();
    }, []);

    const handleFilterChange = (e) => {
        setFilterInput(e.target.value);
    };

    // Filtra los datos basados en el campo "SERIAL"
    const filteredData = inventario.filter(item =>
        item.SERIAL.toLowerCase().includes(filterInput.toLowerCase())
    );

    // Función para descargar el archivo XLSX
    const handleDownload = () => {
        const ws = XLSX.utils.json_to_sheet(inventario);  // Convertir los datos a una hoja de cálculo
        const wb = XLSX.utils.book_new();  // Crear un nuevo libro de trabajo
        XLSX.utils.book_append_sheet(wb, ws, "Inventario");  // Agregar la hoja de trabajo
        XLSX.writeFile(wb, "inventario.xlsx");  // Descargar el archivo
    };

    return (
        <div className="container mx-auto p-6 bg-gray-800 text-white min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-center">Lista de Inventario IPTV</h1>
            <input
                type="text"
                value={filterInput}
                onChange={handleFilterChange}
                placeholder="Buscar por SERIAL..."
                className="mb-6 p-2 border rounded bg-gray-700 text-white placeholder-gray-400 block mx-auto"
            />
            <button
                onClick={handleDownload}
                className="mb-6 px-4 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition-transform duration-200 transform hover:scale-105 block mx-auto"
            >
                Descargar XLSX
            </button>
            {loading ? (
                <p className="text-center">Cargando...</p>
            ) : error ? (
                <p className="text-center text-red-400">{error}</p>
            ) : (
                <div className="overflow-x-auto overflow-y-auto">
                    <table className="min-w-full bg-gray-900 border border-gray-700 rounded-lg mx-auto">
                        <thead>
                            <tr className="bg-gray-800 border-b border-gray-700">
                                {/* Cabezas de tabla */}
                                <th className="px-4 py-2 text-left">Proyecto</th>
                                <th className="px-4 py-2 text-left">Estatus</th>
                                <th className="px-4 py-2 text-left">Contrato Liberty</th>
                                <th className="px-4 py-2 text-left">Orden de Entrega</th>
                                <th className="px-4 py-2 text-left">Fecha de Despacho</th>
                                <th className="px-4 py-2 text-left">Código Cliente BlueSAT</th>
                                <th className="px-4 py-2 text-left">Nombre Contrato Solicitado</th>
                                <th className="px-4 py-2 text-left">Tipo de Contratación</th>
                                <th className="px-4 py-2 text-left">Estatus de Contrato</th>
                                <th className="px-4 py-2 text-left">Código Cliente</th>
                                <th className="px-4 py-2 text-left">Razón Social</th>
                                <th className="px-4 py-2 text-left">Ubicación Final</th>
                                <th className="px-4 py-2 text-left">Tiquete de Entrega</th>
                                <th className="px-4 py-2 text-left">SERIAL</th>
                                <th className="px-4 py-2 text-left">MAC</th>
                                <th className="px-4 py-2 text-left">Observaciones</th>
                                <th className="px-4 py-2 text-left">Contrato Facturación</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((item, index) => (
                                <tr key={index} className="border-b border-gray-700">
                                    <td className="px-4 py-2">{item.Proyecto}</td>
                                    <td className="px-4 py-2">{item.Estatus}</td>
                                    <td className="px-4 py-2">{item.Contrato_Liberty}</td>
                                    <td className="px-4 py-2">{item.OrdenDeEntrega}</td>
                                    <td className="px-4 py-2">{item.FechaDeDespacho}</td>
                                    <td className="px-4 py-2">{item.CodigoClienteBlueSAT}</td>
                                    <td className="px-4 py-2">{item.NombreContratoSolicitado}</td>
                                    <td className="px-4 py-2">{item.TipoContratacion}</td>
                                    <td className="px-4 py-2">{item.EstatusContrato}</td>
                                    <td className="px-4 py-2">{item.CodigoCliente}</td>
                                    <td className="px-4 py-2">{item.RazonSocial}</td>
                                    <td className="px-4 py-2">{item.UbicacionFinal}</td>
                                    <td className="px-4 py-2">{item.TiqueteDeEntrega}</td>
                                    <td className="px-4 py-2">{item.SERIAL}</td>
                                    <td className="px-4 py-2">{item.MAC}</td>
                                    <td className="px-4 py-2">{item.Observaciones}</td>
                                    <td className="px-4 py-2">{item.ContratoFacturacion}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default InventarioList;
