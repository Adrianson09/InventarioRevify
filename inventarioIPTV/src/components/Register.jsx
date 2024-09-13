import  { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // Hook para redireccionar

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:3000/auth/register', {
                nombre_usuario: nombreUsuario,
                email,
                password
            });

            // Redireccionar al usuario después del registro exitoso
            navigate('/login'); // Redirige al usuario al login o a la ruta que prefieras
        } catch (err) {
            setError('Error al registrar el usuario. Verifica los datos ingresados.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 bg-gray-800 text-white min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md">
                <h1 className="text-3xl font-bold mb-6 text-center">Registro de Usuario</h1>
                <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-lg shadow-md">
                    {error && <p className="text-red-400 mb-4">{error}</p>}
                    <div className="mb-4">
                        <label htmlFor="nombre_usuario" className="block text-gray-300 mb-2">Nombre de Usuario</label>
                        <input
                            type="text"
                            id="nombre_usuario"
                            value={nombreUsuario}
                            onChange={(e) => setNombreUsuario(e.target.value)}
                            required
                            className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-300 mb-2">Correo Electrónico</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-gray-300 mb-2">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="confirm_password" className="block text-gray-300 mb-2">Confirmar Contraseña</label>
                        <input
                            type="password"
                            id="confirm_password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Registrando...' : 'Registrar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;
