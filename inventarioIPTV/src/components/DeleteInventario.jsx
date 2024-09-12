import { useState } from 'react';
import axios from 'axios';

const DeleteInventario = () => {
    const [serial, setSerial] = useState('');
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    const handleDelete = async (e) => {
        e.preventDefault();
        try {
            await axios.delete(`http://localhost:3000/inventario/${serial}`);
            setSuccess('Caja IPTV eliminada exitosamente');
            setError(null);
            setSerial(''); // Limpiar el campo de entrada

            // Timeout para borrar el mensaje de éxito después de 3 segundos
            setTimeout(() => {
                setSuccess(null);
            }, 3000);

        } catch (err) {
            setError('Error al eliminar el registro. Inténtalo de nuevo.' + err);
            setSuccess(null);

            // Timeout para borrar el mensaje de error después de 3 segundos
            setTimeout(() => {
                setError(null);
            }, 3000);
        }
    };

    return (
        <div className="container mx-auto p-6 bg-gray-900 text-white min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-center">Eliminar Registro de Inventario IPTV</h1>
            <form onSubmit={handleDelete} className="flex flex-col items-center bg-gray-800 p-6 border border-gray-700 rounded-lg">
                <input
                    type="text"
                    value={serial}
                    onChange={(e) => setSerial(e.target.value)}
                    placeholder="Ingrese el SERIAL a eliminar"
                    className="mb-4 p-3 border border-gray-700 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                    Eliminar Registro
                </button>
            </form>
            {success && <p className="text-green-400 text-center mt-4">{success}</p>}
            {error && <p className="text-red-400 text-center mt-4">{error}</p>}
        </div>
    );
};

export default DeleteInventario;
