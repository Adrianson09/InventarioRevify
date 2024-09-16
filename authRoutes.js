const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const router = express.Router();
require('dotenv').config(); // Asegúrate de tener el archivo .env en tu proyecto

// Configuración de la base de datos
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true, // Cambia esto según tu entorno
        trustServerCertificate: true
    }
};

// Registro de usuario
router.post('/register', async (req, res) => {
    const { nombre_usuario, email, password } = req.body;

    try {
        const pool = await sql.connect(dbConfig);
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.request()
            .input('nombre_usuario', sql.NVarChar, nombre_usuario)
            .input('email', sql.NVarChar, email)
            .input('password_hash', sql.NVarChar, hashedPassword)
            .input('rol', sql.NVarChar, 'contabilidad') // Rol por defecto
            .query(`
                INSERT INTO usuarioInventario (nombre_usuario, email, password_hash, rol)
                VALUES (@nombre_usuario, @email, @password_hash, @rol)
            `);
        res.status(201).send('Usuario registrado exitosamente');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});

// Inicio de sesión
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM usuarioInventario WHERE email = @email');

        if (result.recordset.length === 0) {
            return res.status(401).send('Credenciales incorrectas');
        }

        const user = result.recordset[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).send('Credenciales incorrectas');
        }

        const token = jwt.sign({ id: user.id, nombre_usuario: user.nombre_usuario, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

    if (token == null) return res.status(401).send('Token requerido');

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send('Token inválido');
        req.user = user;
        next();
    });
};

// Middleware para verificar el rol
const authorizeRoles = (...permittedRoles) => {
    return (req, res, next) => {
        const { rol } = req.user; // Extrae el rol del usuario desde el token JWT

        if (!permittedRoles.includes(rol)) {
            return res.status(403).send('No tienes permiso para acceder a esta ruta');
        }

        next();
    };
};

// Ruta protegida: Obtener inventario (acceso permitido solo a 'soporte' y 'admin')
router.get('/', authenticateToken, authorizeRoles('soporte', 'admin', 'contabilidad'), async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM InventarioIPTV');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});

// Ruta protegida: Agregar inventario (solo 'admin')
router.post('/add', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    const { campo1, campo2 } = req.body; // Asegúrate de ajustar los campos según tu estructura de inventario

    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('campo1', sql.NVarChar, campo1)
            .input('campo2', sql.NVarChar, campo2)
            .query(`
                INSERT INTO InventarioIPTV (campo1, campo2)
                VALUES (@campo1, @campo2)
            `);
        res.status(201).send('Inventario agregado exitosamente');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});

// Ruta protegida: Actualizar inventario (solo 'admin')
router.put('/update/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    const { id } = req.params;
    const { campo1, campo2 } = req.body;

    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, id)
            .input('campo1', sql.NVarChar, campo1)
            .input('campo2', sql.NVarChar, campo2)
            .query(`
                UPDATE InventarioIPTV
                SET campo1 = @campo1, campo2 = @campo2
                WHERE id = @id
            `);
        res.status(200).send('Inventario actualizado exitosamente');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});

// Ruta protegida: Eliminar inventario (solo 'admin')
router.delete('/delete/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM InventarioIPTV WHERE id = @id');
        res.status(200).send('Inventario eliminado exitosamente');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});

module.exports = { router, authenticateToken };
