import React, { useState } from 'react';
import axios from 'axios';

const AddInventario = () => {
    const [formData, setFormData] = useState({
        Proyecto: '',
        Estatus: '',
        Contrato_Liberty: '',
        CodigoClienteBlueSAT: '',
        NombreContratoSolicitado: '',
        TipoContratacion: '',
        EstatusContrato: '',
        CodigoCliente: '',
        RazonSocial: '',
        UbicacionFinal: '',
        TiqueteDeEntrega: '',
        SERIAL: '',
        MAC: '',
        Observaciones: '',
        ContratoFacturacion: '',
        tipoServicio: '',
        CantidadDeCajasColocadasRevify: '',
        PrecioIPTVPrincipalRevify: '',
        PrecioIPTVAdicionalRevify: '',
        PrecioIPTVPrincipalLiberty: '',
        PrecioIPTVAdicionalLiberty: '',
        PreciodeConvertidorPrincipalLiberty: '',
        PreciodeConvertidorAdicionalLiberty: '',
        TotaldelContrato: ''
    });

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://172.16.2.103:3000/inventario', formData);
            setSuccess('Registro agregado exitosamente');
            setError(null);

            // Limpiar el formulario
            setFormData({
                Proyecto: '',
                Estatus: '',
                Contrato_Liberty: '',
                CodigoClienteBlueSAT: '',
                NombreContratoSolicitado: '',
                TipoContratacion: '',
                EstatusContrato: '',
                CodigoCliente: '',
                RazonSocial: '',
                UbicacionFinal: '',
                TiqueteDeEntrega: '',
                SERIAL: '',
                MAC: '',
                Observaciones: '',
                ContratoFacturacion: '',
                tipoServicio: '',
                CantidadDeCajasColocadasRevify: '',
                PrecioIPTVPrincipalRevify: '',
                PrecioIPTVAdicionalRevify: '',
                PrecioIPTVPrincipalLiberty: '',
                PrecioIPTVAdicionalLiberty: '',
                PreciodeConvertidorPrincipalLiberty: '',
                PreciodeConvertidorAdicionalLiberty: '',
                TotaldelContrato: ''
            });

            // Timeout para borrar el mensaje de éxito
            setTimeout(() => {
                setSuccess(null);
            }, 3000);

        } catch (err) {
            setError('Error al agregar el registro.');
            setSuccess(null);

            // Timeout para borrar el mensaje de error
            setTimeout(() => {
                setError(null);
            }, 3000);
        }
    };


    return (
        <div className="container mx-auto p-6 bg-gray-900 text-white min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-center">Agregar Nuevo Registro de Inventario IPTV</h1>
            <form onSubmit={handleSubmit} className="bg-gray-800 p-6 border border-gray-700 rounded-lg">
                {Object.keys(formData).map(key => (
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
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Agregar Registro
                </button>
            </form>
        </div>
    );
};

export default AddInventario;
