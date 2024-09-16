import  { useState } from 'react';
import axios from 'axios';

const UploadFile = () => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage('Por favor, selecciona un archivo.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.post('http://172.16.2.103:3000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage('Archivo cargado exitosamente.');
        } catch (err) {
            setMessage('Error al cargar el archivo.' + err);
        }
    };

    return (
        <div className="flex items-top justify-center  bg-gray-900">
        <div className="bg-gray-800 shadow-lg rounded-lg p-6 w-full max-w-lg">
          <h1 className="text-3xl font-bold mb-6 text-center text-white">Cargar Archivo XLSX</h1>
          <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
            <input
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm text-gray-300 bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-transform duration-200 transform hover:scale-105"
            >
              Cargar Archivo
            </button>
          </form>
          {message && (
            <p className="mt-6 text-center text-gray-300">
              {message}
            </p>
          )}
        </div>
      </div>
      
      
    );
};

export default UploadFile;
