import { useState } from 'react';
import axios from 'axios';

const UpdateInventario = () => {
    const [serial, setSerial] = useState(''); // El serial para buscar el registro
    const [formData, setFormData] = useState({
        Proyecto: '',
        Estatus: '',
        Contrato_Liberty: '',
        OrdenDeEntrega: '',
        FechaDeDespacho: '',
        CodigoClienteBlueSAT: '',
        NombreContratoSolicitado: '',
        TipoContratacion: '',
        EstatusContrato: '',
        CodigoCliente: '',
        RazonSocial: '',
        UbicacionFinal: '',
        TiqueteDeEntrega: '',
        MAC: '',
        Observaciones: '',
        ContratoFacturacion: ''
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Manejar los cambios de los campos del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // Cargar el registro por su SERIAL
    const fetchRecord = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/inventario/${serial}`);
            setFormData(response.data); // Rellenar el formulario con los datos obtenidos
            setError(null);
        } catch (err) {
            setError('Error al obtener el registro. Verifica que el serial sea correcto.' + err);
            setSuccess(null);
        }
    };

    // Manejar el envío del formulario para actualizar el registro
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:3000/inventario/${serial}`, formData);
            setSuccess('Registro actualizado exitosamente');
            setError(null);
    
            // Establecer un timeout para borrar el mensaje de éxito después de 3 segundos
            setTimeout(() => {
                setSuccess(null);
            }, 3000);
    
        } catch (err) {
            setError('Error al actualizar el registro. Inténtalo de nuevo.' + err);
            setSuccess(null);
    
            // Establecer un timeout para borrar el mensaje de error después de 3 segundos
            setTimeout(() => {
                setError(null);
            }, 3000);
        }
    };

    return (
        <div className="container mx-auto p-6 bg-gray-900 text-white min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-center">Actualizar Registro de Inventario IPTV</h1>
            
            {/* Formulario para ingresar el SERIAL y buscar el registro */}
            <div className="mb-6">
                <label htmlFor="serial" className="block text-sm font-medium text-gray-300">
                    Ingresa el SERIAL del registro a actualizar
                </label>
                <input
                    type="text"
                    id="serial"
                    value={serial}
                    onChange={(e) => setSerial(e.target.value)}
                    placeholder="Ingrese el serial..."
                    className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <button
                    onClick={fetchRecord}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Buscar Registro
                </button>
            </div>

            {/* Formulario para actualizar los datos del registro */}
            {formData.SERIAL && (
                <form onSubmit={handleSubmit} className="bg-gray-800 p-4 border border-gray-700 rounded-lg">
                    {Object.keys(formData).map((key) => (
                        <div key={key} className="mb-4">
                            <label htmlFor={key} className="block text-sm font-medium text-gray-300">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </label>
                            <input
                                type="text"
                                id={key}
                                name={key}
                                value={formData[key]}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                    ))}
                    {error && <p className="text-red-400">{error}</p>}
                    {success && <p className="text-green-400">{success}</p>}
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                        Actualizar Registro
                    </button>
                </form>
            )}
        </div>
    );
};

export default UpdateInventario;
