const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Configuración de Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Control de Inventario IPTV',
            version: '1.0.0',
            description: 'Documentación de la API para el control de inventario de cajas IPTV',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3000}`, // Utiliza la variable de entorno para el puerto
            },
        ],
    },
    apis: ['./index.js'], // Ruta a tus archivos de rutas que contienen comentarios de Swagger
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Configura Swagger UI
const swaggerMiddleware = swaggerUi.serve;
const swaggerSetup = swaggerUi.setup(swaggerDocs);

module.exports = { swaggerMiddleware, swaggerSetup };
