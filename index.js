const express = require('express');
const sql = require('mssql');
const multer = require('multer');
const XLSX = require('xlsx');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cors = require('cors');
const { swaggerMiddleware, swaggerSetup } = require('./swagger'); // Importa la configuración de Swagger
const { router: authRoutes, authenticateToken } = require('./authRoutes'); // Importa las rutas de autenticación

const app = express();
app.use(express.json()); // Para analizar el cuerpo de las solicitudes en formato JSON
const upload = multer({ dest: 'uploads/' });
const port = process.env.PORT || 3000;

// Configuración de CORS
app.use(cors()); 

// Configuración de la conexión a SQL Server
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true, // Si estás utilizando Azure, de lo contrario, puedes poner false
        trustServerCertificate: true, // True si estás utilizando SQL Server local
    }
};

// Conexión a la base de datos
sql.connect(dbConfig).then(pool => {
    if (pool.connected) {
        console.log('Conexión exitosa a SQL Server');
    }
    
    // Usa Swagger UI
    app.use('/api-docs', swaggerMiddleware, swaggerSetup);

    // Usa las rutas de autenticación
    app.use('/auth', authRoutes);

    // Ejemplo de endpoint protegido
    app.get('/protected', authenticateToken, (req, res) => {
        res.send('Acceso concedido a la ruta protegida');
    });

    // Endpoint para obtener los detalles del usuario autenticado
    app.get('/auth/me', authenticateToken, async (req, res) => {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('userId', sql.Int, req.user.id)
                .query('SELECT id, nombre_usuario, email, rol FROM usuarioInventario WHERE id = @userId');

            if (result.recordset.length === 0) {
                return res.status(404).send('Usuario no encontrado');
            }

            res.json(result.recordset[0]);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error en el servidor');
        }
    });

/**Carga masiva de datos de inventario desde un archivo XLSX.
 * @swagger
 * /upload:
 *   post:
 *     summary: Carga masiva de datos de inventario desde un archivo XLSX.
 *     description: Este endpoint permite cargar un archivo XLSX con los datos del inventario IPTV y agregarlos a la base de datos.
 *     tags: [Carga de Inventario]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         description: Archivo XLSX a cargar.
 *         required: true
 *     responses:
 *       200:
 *         description: Datos cargados exitosamente.
 *       400:
 *         description: No se ha proporcionado ningún archivo o el archivo es inválido.
 *       500:
 *         description: Error del servidor al procesar el archivo.
 */

// Upload de archivo
// Upload de archivo
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        // Leer el archivo XLSX
        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        // Conectar a la base de datos
        let pool = await sql.connect(dbConfig);

        // Insertar los datos en la base de datos
        for (const row of data) {
            await pool.request()
                .input('Proyecto', sql.NVarChar, row.Proyecto)
                .input('Estatus', sql.NVarChar, row.Estatus)
                .input('Contrato_Liberty', sql.NVarChar, row.Contrato_Liberty)
                .input('CodigoClienteBlueSAT', sql.NVarChar, row.CodigoClienteBlueSAT)
                .input('NombreContratoSolicitado', sql.NVarChar, row.NombreContratoSolicitado)
                .input('TipoContratacion', sql.NVarChar, row.TipoContratacion)
                .input('EstatusContrato', sql.NVarChar, row.EstatusContrato)
                .input('CodigoCliente', sql.NVarChar, row.CodigoCliente)
                .input('RazonSocial', sql.NVarChar, row.RazonSocial)
                .input('UbicacionFinal', sql.NVarChar, row.UbicacionFinal)
                .input('TiqueteDeEntrega', sql.NVarChar, row.TiqueteDeEntrega)
                .input('SERIAL', sql.NVarChar, row.SERIAL)
                .input('MAC', sql.NVarChar, row.MAC)
                .input('Observaciones', sql.NVarChar, row.Observaciones)
                .input('ContratoFacturacion', sql.NVarChar, row.ContratoFacturacion)
                .input('tipoServicio', sql.NVarChar, row.tipoServicio)
                .input('CantidadDeCajasColocadasRevify', sql.Int, row.CantidadDeCajasColocadasRevify)
                .input('PrecioIPTVPrincipalRevify', sql.Decimal(18, 2), row.PrecioIPTVPrincipalRevify)
                .input('PrecioIPTVAdicionalRevify', sql.Decimal(18, 2), row.PrecioIPTVAdicionalRevify)
                .input('PrecioIPTVPrincipalLiberty', sql.Decimal(18, 2), row.PrecioIPTVPrincipalLiberty)
                .input('PrecioIPTVAdicionalLiberty', sql.Decimal(18, 2), row.PrecioIPTVAdicionalLiberty)
                .input('PreciodeConvertidorPrincipalLiberty', sql.Decimal(18, 2), row.PreciodeConvertidorPrincipalLiberty)
                .input('PreciodeConvertidorAdicionalLiberty', sql.Decimal(18, 2), row.PreciodeConvertidorAdicionalLiberty)
                .input('TotaldelContrato', sql.Decimal(18, 2), row.TotaldelContrato)
                .query(`
                    INSERT INTO InventarioIPTV (
                        Proyecto,
                        Estatus,
                        Contrato_Liberty,
                        CodigoClienteBlueSAT,
                        NombreContratoSolicitado,
                        TipoContratacion,
                        EstatusContrato,
                        CodigoCliente,
                        RazonSocial,
                        UbicacionFinal,
                        TiqueteDeEntrega,
                        SERIAL,
                        MAC,
                        Observaciones,
                        ContratoFacturacion,
                        tipoServicio,
                        CantidadDeCajasColocadasRevify,
                        PrecioIPTVPrincipalRevify,
                        PrecioIPTVAdicionalRevify,
                        PrecioIPTVPrincipalLiberty,
                        PrecioIPTVAdicionalLiberty,
                        PreciodeConvertidorPrincipalLiberty,
                        PreciodeConvertidorAdicionalLiberty,
                        TotaldelContrato
                    ) VALUES (
                        @Proyecto,
                        @Estatus,
                        @Contrato_Liberty,
                        @CodigoClienteBlueSAT,
                        @NombreContratoSolicitado,
                        @TipoContratacion,
                        @EstatusContrato,
                        @CodigoCliente,
                        @RazonSocial,
                        @UbicacionFinal,
                        @TiqueteDeEntrega,
                        @SERIAL,
                        @MAC,
                        @Observaciones,
                        @ContratoFacturacion,
                        @tipoServicio,
                        @CantidadDeCajasColocadasRevify,
                        @PrecioIPTVPrincipalRevify,
                        @PrecioIPTVAdicionalRevify,
                        @PrecioIPTVPrincipalLiberty,
                        @PrecioIPTVAdicionalLiberty,
                        @PreciodeConvertidorPrincipalLiberty,
                        @PreciodeConvertidorAdicionalLiberty,
                        @TotaldelContrato
                    )
                `);
        }

        res.status(200).send('Datos cargados exitosamente.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor.');
    }
});




/**
 * @swagger
 * /inventario:
 *   get:
 *     summary: Obtiene el inventario de IPTV
 *     description: Retorna una lista de todas las cajas IPTV con sus detalles en el inventario.
 *     tags: [Inventario]
 *     responses:
 *       200:
 *         description: Lista de cajas IPTV
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Proyecto:
 *                     type: string
 *                     description: El proyecto al que pertenece.
 *                   Estatus:
 *                     type: string
 *                     description: El estatus actual de la caja.
 *                   Contrato_Liberty:
 *                     type: string
 *                     description: El contrato asociado de Liberty.
 *                   CodigoClienteBlueSAT:
 *                     type: string
 *                     description: Código del cliente de BlueSAT.
 *                   NombreContratoSolicitado:
 *                     type: string
 *                     description: Nombre del contrato solicitado.
 *                   TipoContratacion:
 *                     type: string
 *                     description: Tipo de contratación.
 *                   EstatusContrato:
 *                     type: string
 *                     description: El estatus del contrato.
 *                   CodigoCliente:
 *                     type: string
 *                     description: Código del cliente.
 *                   RazonSocial:
 *                     type: string
 *                     description: Razón social del cliente.
 *                   UbicacionFinal:
 *                     type: string
 *                     description: La ubicación final de la caja.
 *                   TiqueteDeEntrega:
 *                     type: string
 *                     description: Tiquete de entrega de la caja.
 *                   SERIAL:
 *                     type: string
 *                     description: Número de serie de la caja.
 *                   MAC:
 *                     type: string
 *                     description: Dirección MAC de la caja.
 *                   Observaciones:
 *                     type: string
 *                     description: Cualquier observación adicional.
 *                   ContratoFacturacion:
 *                     type: string
 *                     description: El contrato de facturación asociado.
 *                   tipoServicio:
 *                     type: string
 *                     description: El tipo de servicio proporcionado.
 *                   CantidadDeCajasColocadasRevify:
 *                     type: integer
 *                     description: La cantidad de cajas colocadas por Revify.
 *                   PrecioIPTVPrincipalRevify:
 *                     type: number
 *                     format: float
 *                     description: El precio del servicio IPTV principal por Revify.
 *                   PrecioIPTVAdicionalRevify:
 *                     type: number
 *                     format: float
 *                     description: El precio del servicio IPTV adicional por Revify.
 *                   PrecioIPTVPrincipalLiberty:
 *                     type: number
 *                     format: float
 *                     description: El precio del servicio IPTV principal por Liberty.
 *                   PrecioIPTVAdicionalLiberty:
 *                     type: number
 *                     format: float
 *                     description: El precio del servicio IPTV adicional por Liberty.
 *                   PreciodeConvertidorPrincipalLiberty:
 *                     type: number
 *                     format: float
 *                     description: El precio del convertidor principal por Liberty.
 *                   PreciodeConvertidorAdicionalLiberty:
 *                     type: number
 *                     format: float
 *                     description: El precio del convertidor adicional por Liberty.
 *                   TotaldelContrato:
 *                     type: number
 *                     format: float
 *                     description: El monto total del contrato.
 *                   usuario_modificador:
 *                     type: string
 *                     description: El usuario que realizó la última modificación.
 *                   fecha_creacion:
 *                     type: string
 *                     format: date-time
 *                     description: Fecha de creación del registro.
 *                   usuario_creacion:
 *                     type: string
 *                     description: El usuario que creó el registro.
 *                   id:
 *                     type: integer
 *                     description: ID único del registro.
 *       500:
 *         description: Error en el servidor
 */

app.get('/inventario', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query('SELECT * FROM InventarioIPTV');
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});



/** Inserta una nueva caja en el inventario
 * @swagger
 * /inventario:
 *   post:
 *     summary: Inserta una nueva caja en el inventario
 *     description: Permite agregar una nueva caja IPTV al inventario.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Proyecto:
 *                 type: string
 *                 description: El proyecto al que pertenece.
 *               Estatus:
 *                 type: string
 *                 description: El estatus actual de la caja.
 *               Contrato_Liberty:
 *                 type: string
 *                 description: El contrato asociado de Liberty.
 *               CodigoClienteBlueSAT:
 *                 type: string
 *                 description: Código del cliente de BlueSAT.
 *               NombreContratoSolicitado:
 *                 type: string
 *                 description: Nombre del contrato solicitado.
 *               TipoContratacion:
 *                 type: string
 *                 description: Tipo de contratación.
 *               EstatusContrato:
 *                 type: string
 *                 description: El estatus del contrato.
 *               CodigoCliente:
 *                 type: string
 *                 description: Código del cliente.
 *               RazonSocial:
 *                 type: string
 *                 description: Razón social del cliente.
 *               UbicacionFinal:
 *                 type: string
 *                 description: La ubicación final de la caja.
 *               TiqueteDeEntrega:
 *                 type: string
 *                 description: Tiquete de entrega de la caja.
 *               SERIAL:
 *                 type: string
 *                 description: Número de serie de la caja.
 *               MAC:
 *                 type: string
 *                 description: Dirección MAC de la caja.
 *               Observaciones:
 *                 type: string
 *                 description: Cualquier observación adicional.
 *               ContratoFacturacion:
 *                 type: string
 *                 description: El contrato de facturación asociado.
 *               tipoServicio:
 *                 type: string
 *                 description: Tipo de servicio.
 *               CantidadDeCajasColocadasRevify:
 *                 type: integer
 *                 description: Cantidad de cajas colocadas (Revify).
 *               PrecioIPTVPrincipalRevify:
 *                 type: number
 *                 format: float
 *                 description: Precio IPTV principal (Revify).
 *               PrecioIPTVAdicionalRevify:
 *                 type: number
 *                 format: float
 *                 description: Precio IPTV adicional (Revify).
 *               PrecioIPTVPrincipalLiberty:
 *                 type: number
 *                 format: float
 *                 description: Precio IPTV principal (Liberty).
 *               PrecioIPTVAdicionalLiberty:
 *                 type: number
 *                 format: float
 *                 description: Precio IPTV adicional (Liberty).
 *               PreciodeConvertidorPrincipalLiberty:
 *                 type: number
 *                 format: float
 *                 description: Precio del convertidor principal (Liberty).
 *               PreciodeConvertidorAdicionalLiberty:
 *                 type: number
 *                 format: float
 *                 description: Precio del convertidor adicional (Liberty).
 *               TotaldelContrato:
 *                 type: number
 *                 format: float
 *                 description: Total del contrato.
 *     responses:
 *       201:
 *         description: Caja IPTV creada exitosamente
 *       400:
 *         description: Error en la solicitud
 *       500:
 *         description: Error en el servidor
 */

// Insert inventario
app.post('/inventario', async (req, res) => {
    const {
        Proyecto,
        Estatus,
        Contrato_Liberty,
        CodigoClienteBlueSAT,
        NombreContratoSolicitado,
        TipoContratacion,
        EstatusContrato,
        CodigoCliente,
        RazonSocial,
        UbicacionFinal,
        TiqueteDeEntrega,
        SERIAL,
        MAC,
        Observaciones,
        ContratoFacturacion,
        tipoServicio,
        CantidadDeCajasColocadasRevify,
        PrecioIPTVPrincipalRevify,
        PrecioIPTVAdicionalRevify,
        PrecioIPTVPrincipalLiberty,
        PrecioIPTVAdicionalLiberty,
        PreciodeConvertidorPrincipalLiberty,
        PreciodeConvertidorAdicionalLiberty,
        TotaldelContrato
    } = req.body;

    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('Proyecto', sql.NVarChar, Proyecto)
            .input('Estatus', sql.NVarChar, Estatus)
            .input('Contrato_Liberty', sql.NVarChar, Contrato_Liberty)
            .input('CodigoClienteBlueSAT', sql.NVarChar, CodigoClienteBlueSAT)
            .input('NombreContratoSolicitado', sql.NVarChar, NombreContratoSolicitado)
            .input('TipoContratacion', sql.NVarChar, TipoContratacion)
            .input('EstatusContrato', sql.NVarChar, EstatusContrato)
            .input('CodigoCliente', sql.NVarChar, CodigoCliente)
            .input('RazonSocial', sql.NVarChar, RazonSocial)
            .input('UbicacionFinal', sql.NVarChar, UbicacionFinal)
            .input('TiqueteDeEntrega', sql.NVarChar, TiqueteDeEntrega)
            .input('SERIAL', sql.NVarChar, SERIAL)
            .input('MAC', sql.NVarChar, MAC)
            .input('Observaciones', sql.NVarChar, Observaciones)
            .input('ContratoFacturacion', sql.NVarChar, ContratoFacturacion)
            .input('tipoServicio', sql.NVarChar, tipoServicio)
            .input('CantidadDeCajasColocadasRevify', sql.Int, CantidadDeCajasColocadasRevify)
            .input('PrecioIPTVPrincipalRevify', sql.Decimal(18, 2), PrecioIPTVPrincipalRevify)
            .input('PrecioIPTVAdicionalRevify', sql.Decimal(18, 2), PrecioIPTVAdicionalRevify)
            .input('PrecioIPTVPrincipalLiberty', sql.Decimal(18, 2), PrecioIPTVPrincipalLiberty)
            .input('PrecioIPTVAdicionalLiberty', sql.Decimal(18, 2), PrecioIPTVAdicionalLiberty)
            .input('PreciodeConvertidorPrincipalLiberty', sql.Decimal(18, 2), PreciodeConvertidorPrincipalLiberty)
            .input('PreciodeConvertidorAdicionalLiberty', sql.Decimal(18, 2), PreciodeConvertidorAdicionalLiberty)
            .input('TotaldelContrato', sql.Decimal(18, 2), TotaldelContrato)
            .query(`
                INSERT INTO InventarioIPTV (
                    Proyecto,
                    Estatus,
                    Contrato_Liberty,
                    CodigoClienteBlueSAT,
                    NombreContratoSolicitado,
                    TipoContratacion,
                    EstatusContrato,
                    CodigoCliente,
                    RazonSocial,
                    UbicacionFinal,
                    TiqueteDeEntrega,
                    SERIAL,
                    MAC,
                    Observaciones,
                    ContratoFacturacion,
                    tipoServicio,
                    CantidadDeCajasColocadasRevify,
                    PrecioIPTVPrincipalRevify,
                    PrecioIPTVAdicionalRevify,
                    PrecioIPTVPrincipalLiberty,
                    PrecioIPTVAdicionalLiberty,
                    PreciodeConvertidorPrincipalLiberty,
                    PreciodeConvertidorAdicionalLiberty,
                    TotaldelContrato
                )
                VALUES (
                    @Proyecto,
                    @Estatus,
                    @Contrato_Liberty,
                    @CodigoClienteBlueSAT,
                    @NombreContratoSolicitado,
                    @TipoContratacion,
                    @EstatusContrato,
                    @CodigoCliente,
                    @RazonSocial,
                    @UbicacionFinal,
                    @TiqueteDeEntrega,
                    @SERIAL,
                    @MAC,
                    @Observaciones,
                    @ContratoFacturacion,
                    @tipoServicio,
                    @CantidadDeCajasColocadasRevify,
                    @PrecioIPTVPrincipalRevify,
                    @PrecioIPTVAdicionalRevify,
                    @PrecioIPTVPrincipalLiberty,
                    @PrecioIPTVAdicionalLiberty,
                    @PreciodeConvertidorPrincipalLiberty,
                    @PreciodeConvertidorAdicionalLiberty,
                    @TotaldelContrato
                )
            `);
        res.status(201).send('Caja IPTV creada exitosamente');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});



/** Actualiza una caja en el inventario
 * @swagger
 * /inventario/{serial}:
 *   put:
 *     summary: Actualiza una caja en el inventario
 *     description: Permite actualizar los detalles de una caja IPTV en el inventario.
 *     parameters:
 *       - name: serial
 *         in: path
 *         required: true
 *         description: El número de serie de la caja IPTV a actualizar.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Proyecto:
 *                 type: string
 *                 description: El proyecto al que pertenece.
 *               Estatus:
 *                 type: string
 *                 description: El estatus actual de la caja.
 *               Contrato_Liberty:
 *                 type: string
 *                 description: El contrato asociado de Liberty.
 *               CodigoClienteBlueSAT:
 *                 type: string
 *                 description: Código del cliente de BlueSAT.
 *               NombreContratoSolicitado:
 *                 type: string
 *                 description: Nombre del contrato solicitado.
 *               TipoContratacion:
 *                 type: string
 *                 description: Tipo de contratación.
 *               EstatusContrato:
 *                 type: string
 *                 description: El estatus del contrato.
 *               CodigoCliente:
 *                 type: string
 *                 description: Código del cliente.
 *               RazonSocial:
 *                 type: string
 *                 description: Razón social del cliente.
 *               UbicacionFinal:
 *                 type: string
 *                 description: La ubicación final de la caja.
 *               TiqueteDeEntrega:
 *                 type: string
 *                 description: Tiquete de entrega de la caja.
 *               MAC:
 *                 type: string
 *                 description: Dirección MAC de la caja.
 *               Observaciones:
 *                 type: string
 *                 description: Cualquier observación adicional.
 *               ContratoFacturacion:
 *                 type: string
 *                 description: El contrato de facturación asociado.
 *               tipoServicio:
 *                 type: string
 *                 description: Tipo de servicio.
 *               CantidadDeCajasColocadasRevify:
 *                 type: integer
 *                 description: Cantidad de cajas colocadas (Revify).
 *               PrecioIPTVPrincipalRevify:
 *                 type: number
 *                 format: float
 *                 description: Precio IPTV principal (Revify).
 *               PrecioIPTVAdicionalRevify:
 *                 type: number
 *                 format: float
 *                 description: Precio IPTV adicional (Revify).
 *               PrecioIPTVPrincipalLiberty:
 *                 type: number
 *                 format: float
 *                 description: Precio IPTV principal (Liberty).
 *               PrecioIPTVAdicionalLiberty:
 *                 type: number
 *                 format: float
 *                 description: Precio IPTV adicional (Liberty).
 *               PreciodeConvertidorPrincipalLiberty:
 *                 type: number
 *                 format: float
 *                 description: Precio del convertidor principal (Liberty).
 *               PreciodeConvertidorAdicionalLiberty:
 *                 type: number
 *                 format: float
 *                 description: Precio del convertidor adicional (Liberty).
 *               TotaldelContrato:
 *                 type: number
 *                 format: float
 *                 description: Total del contrato.
 *     responses:
 *       200:
 *         description: Caja IPTV actualizada exitosamente
 *       400:
 *         description: Error en la solicitud
 *       404:
 *         description: Registro no encontrado
 *       500:
 *         description: Error en el servidor
 */
 
// Actualiza Inventario
app.put('/inventario/:serial', async (req, res) => {
    const { serial } = req.params;
    const {
        Proyecto,
        Estatus,
        Contrato_Liberty,
        CodigoClienteBlueSAT,
        NombreContratoSolicitado,
        TipoContratacion,
        EstatusContrato,
        CodigoCliente,
        RazonSocial,
        UbicacionFinal,
        TiqueteDeEntrega,
        MAC,
        Observaciones,
        ContratoFacturacion,
        tipoServicio,
        CantidadDeCajasColocadasRevify,
        PrecioIPTVPrincipalRevify,
        PrecioIPTVAdicionalRevify,
        PrecioIPTVPrincipalLiberty,
        PrecioIPTVAdicionalLiberty,
        PreciodeConvertidorPrincipalLiberty,
        PreciodeConvertidorAdicionalLiberty,
        TotaldelContrato
    } = req.body;

    try {
        let pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('Serial', sql.NVarChar, serial)
            .input('Proyecto', sql.NVarChar, Proyecto)
            .input('Estatus', sql.NVarChar, Estatus)
            .input('Contrato_Liberty', sql.NVarChar, Contrato_Liberty)
            .input('CodigoClienteBlueSAT', sql.NVarChar, CodigoClienteBlueSAT)
            .input('NombreContratoSolicitado', sql.NVarChar, NombreContratoSolicitado)
            .input('TipoContratacion', sql.NVarChar, TipoContratacion)
            .input('EstatusContrato', sql.NVarChar, EstatusContrato)
            .input('CodigoCliente', sql.NVarChar, CodigoCliente)
            .input('RazonSocial', sql.NVarChar, RazonSocial)
            .input('UbicacionFinal', sql.NVarChar, UbicacionFinal)
            .input('TiqueteDeEntrega', sql.NVarChar, TiqueteDeEntrega)
            .input('MAC', sql.NVarChar, MAC)
            .input('Observaciones', sql.NVarChar, Observaciones)
            .input('ContratoFacturacion', sql.NVarChar, ContratoFacturacion)
            .input('tipoServicio', sql.NVarChar, tipoServicio)
            .input('CantidadDeCajasColocadasRevify', sql.Int, CantidadDeCajasColocadasRevify)
            .input('PrecioIPTVPrincipalRevify', sql.Decimal(18, 2), PrecioIPTVPrincipalRevify)
            .input('PrecioIPTVAdicionalRevify', sql.Decimal(18, 2), PrecioIPTVAdicionalRevify)
            .input('PrecioIPTVPrincipalLiberty', sql.Decimal(18, 2), PrecioIPTVPrincipalLiberty)
            .input('PrecioIPTVAdicionalLiberty', sql.Decimal(18, 2), PrecioIPTVAdicionalLiberty)
            .input('PreciodeConvertidorPrincipalLiberty', sql.Decimal(18, 2), PreciodeConvertidorPrincipalLiberty)
            .input('PreciodeConvertidorAdicionalLiberty', sql.Decimal(18, 2), PreciodeConvertidorAdicionalLiberty)
            .input('TotaldelContrato', sql.Decimal(18, 2), TotaldelContrato)
            .query(`
                UPDATE InventarioIPTV
                SET
                    Proyecto = @Proyecto,
                    Estatus = @Estatus,
                    Contrato_Liberty = @Contrato_Liberty,
                    CodigoClienteBlueSAT = @CodigoClienteBlueSAT,
                    NombreContratoSolicitado = @NombreContratoSolicitado,
                    TipoContratacion = @TipoContratacion,
                    EstatusContrato = @EstatusContrato,
                    CodigoCliente = @CodigoCliente,
                    RazonSocial = @RazonSocial,
                    UbicacionFinal = @UbicacionFinal,
                    TiqueteDeEntrega = @TiqueteDeEntrega,
                    MAC = @MAC,
                    Observaciones = @Observaciones,
                    ContratoFacturacion = @ContratoFacturacion,
                    tipoServicio = @tipoServicio,
                    CantidadDeCajasColocadasRevify = @CantidadDeCajasColocadasRevify,
                    PrecioIPTVPrincipalRevify = @PrecioIPTVPrincipalRevify,
                    PrecioIPTVAdicionalRevify = @PrecioIPTVAdicionalRevify,
                    PrecioIPTVPrincipalLiberty = @PrecioIPTVPrincipalLiberty,
                    PrecioIPTVAdicionalLiberty = @PrecioIPTVAdicionalLiberty,
                    PreciodeConvertidorPrincipalLiberty = @PreciodeConvertidorPrincipalLiberty,
                    PreciodeConvertidorAdicionalLiberty = @PreciodeConvertidorAdicionalLiberty,
                    TotaldelContrato = @TotaldelContrato
                WHERE SERIAL = @Serial
            `);
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).send('Registro no encontrado');
        }

        res.status(200).send('Caja IPTV actualizada exitosamente');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});



/** Elimina una caja del inventario
 * @swagger
 * /inventario/{serial}:
 *   delete:
 *     summary: Elimina una caja del inventario
 *     description: Permite eliminar una caja IPTV del inventario usando su número de serie.
 *     parameters:
 *       - name: serial
 *         in: path
 *         required: true
 *         description: El número de serie de la caja IPTV a eliminar.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Caja IPTV eliminada exitosamente
 *       404:
 *         description: Registro no encontrado
 *       500:
 *         description: Error en el servidor
 */
// Elimina registro
app.delete('/inventario/:serial', async (req, res) => {
    const { serial } = req.params;

    try {
        let pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('Serial', sql.NVarChar, serial)
            .query('DELETE FROM InventarioIPTV WHERE SERIAL = @Serial');
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).send('Registro no encontrado');
        }

        res.status(200).send('Caja IPTV eliminada exitosamente');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});


/** Obtiene un registro específico del inventario por SERIAL
 * @swagger
 * /inventario/{serial}:
 *   get:
 *     summary: Obtiene un registro específico del inventario por SERIAL
 *     parameters:
 *       - in: path
 *         name: serial
 *         schema:
 *           type: string
 *         required: true
 *         description: El número de serie del registro a obtener
 *     responses:
 *       200:
 *         description: Registro obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Proyecto:
 *                   type: string
 *                 Estatus:
 *                   type: string
 *                 Contrato_Liberty:
 *                   type: string
 *                 OrdenDeEntrega:
 *                   type: string
 *                 FechaDeDespacho:
 *                   type: string
 *                 CodigoClienteBlueSAT:
 *                   type: string
 *                 NombreContratoSolicitado:
 *                   type: string
 *                 TipoContratacion:
 *                   type: string
 *                 EstatusContrato:
 *                   type: string
 *                 CodigoCliente:
 *                   type: string
 *                 RazonSocial:
 *                   type: string
 *                 UbicacionFinal:
 *                   type: string
 *                 TiqueteDeEntrega:
 *                   type: string
 *                 SERIAL:
 *                   type: string
 *                 MAC:
 *                   type: string
 *                 Observaciones:
 *                   type: string
 *                 ContratoFacturacion:
 *                   type: string
 *       404:
 *         description: Registro no encontrado
 *       500:
 *         description: Error en el servidor
 */
// Obtener un registro específico por SERIAL
app.get('/inventario/:serial', async (req, res) => {
    const { serial } = req.params;

    try {
        let pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('Serial', sql.NVarChar, serial)
            .query('SELECT * FROM InventarioIPTV WHERE SERIAL = @Serial');
        
        if (result.recordset.length === 0) {
            return res.status(404).send('Registro no encontrado');
        }

        res.status(200).json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});



}).catch(error => {
    console.error('Error al conectar a SQL Server:', error);
});

// Inicia el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});