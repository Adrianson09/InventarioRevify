const express = require('express');
const sql = require('mssql');
require('dotenv').config();
const cors = require('cors');
const { swaggerMiddleware, swaggerSetup } = require('./swagger'); // Importa la configuración de Swagger

const app = express();
app.use(express.json()); // Para analizar el cuerpo de las solicitudes en formato JSON

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
        encrypt: false
    }
};

// Conexión a la base de datos
sql.connect(dbConfig).then(pool => {
    if (pool.connected) {
        console.log('Conexión exitosa a SQL Server');
    }
    
    // Usa Swagger UI
    app.use('/api-docs', swaggerMiddleware, swaggerSetup);

}).catch(error => {
    console.error('Error al conectar a SQL Server:', error);
});

/** Obtiene el inventario de IPTV
 * @swagger
 * /inventario:
 *   get:
 *     summary: Obtiene el inventario de IPTV
 *     description: Retorna una lista de todas las cajas IPTV con sus detalles en el inventario.
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
 *                   OrdenDeEntrega:
 *                     type: string
 *                     description: El número de orden de entrega.
 *                   FechaDeDespacho:
 *                     type: string
 *                     format: date
 *                     description: La fecha de despacho.
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
 *       500:
 *         description: Error en el servidor
 */
// Obtiene el inventario de IPTV
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



/**Inserta una nueva caja en el inventario
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
 *               OrdenDeEntrega:
 *                 type: string
 *                 description: El número de orden de entrega.
 *               FechaDeDespacho:
 *                 type: string
 *                 format: date
 *                 description: La fecha de despacho.
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
        Proyecto, Estatus, Contrato_Liberty, OrdenDeEntrega, FechaDeDespacho,
        CodigoClienteBlueSAT, NombreContratoSolicitado, TipoContratacion, EstatusContrato,
        CodigoCliente, RazonSocial, UbicacionFinal, TiqueteDeEntrega, SERIAL, MAC,
        Observaciones, ContratoFacturacion
    } = req.body;

    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('Proyecto', sql.NVarChar, Proyecto)
            .input('Estatus', sql.NVarChar, Estatus)
            .input('Contrato_Liberty', sql.NVarChar, Contrato_Liberty)
            .input('OrdenDeEntrega', sql.NVarChar, OrdenDeEntrega)
            .input('FechaDeDespacho', sql.Date, FechaDeDespacho)
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
            .query(`
                INSERT INTO InventarioIPTV (
                    Proyecto, Estatus, Contrato_Liberty, OrdenDeEntrega, FechaDeDespacho,
                    CodigoClienteBlueSAT, NombreContratoSolicitado, TipoContratacion, EstatusContrato,
                    CodigoCliente, RazonSocial, UbicacionFinal, TiqueteDeEntrega, SERIAL, MAC,
                    Observaciones, ContratoFacturacion
                )
                VALUES (
                    @Proyecto, @Estatus, @Contrato_Liberty, @OrdenDeEntrega, @FechaDeDespacho,
                    @CodigoClienteBlueSAT, @NombreContratoSolicitado, @TipoContratacion, @EstatusContrato,
                    @CodigoCliente, @RazonSocial, @UbicacionFinal, @TiqueteDeEntrega, @SERIAL, @MAC,
                    @Observaciones, @ContratoFacturacion
                )
            `);
        res.status(201).send('Caja IPTV creada exitosamente');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});



/**Actualiza una caja en el inventario
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
 *               OrdenDeEntrega:
 *                 type: string
 *                 description: El número de orden de entrega.
 *               FechaDeDespacho:
 *                 type: string
 *                 format: date
 *                 description: La fecha de despacho.
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
        Proyecto, Estatus, Contrato_Liberty, OrdenDeEntrega, FechaDeDespacho,
        CodigoClienteBlueSAT, NombreContratoSolicitado, TipoContratacion, EstatusContrato,
        CodigoCliente, RazonSocial, UbicacionFinal, TiqueteDeEntrega, MAC,
        Observaciones, ContratoFacturacion
    } = req.body;

    try {
        let pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('Serial', sql.NVarChar, serial)
            .input('Proyecto', sql.NVarChar, Proyecto)
            .input('Estatus', sql.NVarChar, Estatus)
            .input('Contrato_Liberty', sql.NVarChar, Contrato_Liberty)
            .input('OrdenDeEntrega', sql.NVarChar, OrdenDeEntrega)
            .input('FechaDeDespacho', sql.Date, FechaDeDespacho)
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
            .query(`
                UPDATE InventarioIPTV
                SET
                    Proyecto = @Proyecto,
                    Estatus = @Estatus,
                    Contrato_Liberty = @Contrato_Liberty,
                    OrdenDeEntrega = @OrdenDeEntrega,
                    FechaDeDespacho = @FechaDeDespacho,
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
                    ContratoFacturacion = @ContratoFacturacion
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



app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
