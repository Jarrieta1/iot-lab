const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Almacenamiento temporal de las lecturas recibidas.
// El dashboard solo necesita los dos registros más recientes.
const lecturas = [];
const MAX_LECTURAS = 100;

app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/data', (req, res) => {
    // Se mantiene la respuesta como un arreglo para no romper el dashboard.
    res.json(lecturas.slice(-2));
});

app.post('/visualize', (req, res) => {
    const datosRecibidos = req.body;

    if (!datosRecibidos || Object.keys(datosRecibidos).length === 0) {
        return res.status(400).json({
            error: 'No se enviaron datos',
            sugerencia: 'Envía un JSON con temperatura, humedad, etc.',
        });
    }

    const lectura = {
        ...datosRecibidos,
        timestamp: datosRecibidos.timestamp || new Date().toISOString(),
    };

    lecturas.push(lectura);
    if (lecturas.length > MAX_LECTURAS) {
        lecturas.shift();
    }

    console.log('📥 Lectura recibida:', lectura);

    res.status(201).json({
        mensaje: '✅ Datos recibidos correctamente',
        datosEnviados: lectura,
    });
});

app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📊 GET /data  -> http://localhost:${PORT}/data`);
    console.log(`📤 POST /visualize -> http://localhost:${PORT}/visualize`);
    console.log(`🖥️ Dashboard -> http://localhost:${PORT}/`);
    console.log('💾 Las lecturas se almacenan temporalmente en memoria');
});
