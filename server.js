const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/data", async (req, res) => {
  try {
    const respuesta = await fetch(
      "https://iot-lab-production.up.railway.app/data",
    );
    const datos = await respuesta.json();
    const ultimosDos = Array.isArray(datos) ? datos.slice(-2) : [];
    res.json(ultimosDos);
  } catch (error) {
    console.error("❌ Error en GET /data:", error.message);
    res.status(500).json({
      error: "No se pudieron obtener los datos del profesor",
      mensaje: error.message,
    });
  }
});

app.post("/visualize", async (req, res) => {
  const datosRecibidos = req.body;

  if (!datosRecibidos || Object.keys(datosRecibidos).length === 0) {
    return res.status(400).json({
      error: "No se enviaron datos",
      sugerencia: "Envía un JSON con temperatura, humedad, etc.",
    });
  }

  try {
    console.log("📥 Datos recibidos del estudiante:", datosRecibidos);

    const respuestaProfesor = await fetch(
      "https://iot-lab-production.up.railway.app/data",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosRecibidos),
      },
    );

    if (!respuestaProfesor.ok) {
      throw new Error(`Error del profesor: ${respuestaProfesor.status}`);
    }

    const resultadoProfesor = await respuestaProfesor.json();

    console.log("✅ Datos enviados al profesor correctamente");

    res.json({
      mensaje: "✅ Datos enviados al profesor correctamente",
      datosEnviados: datosRecibidos,
      respuestaProfesor: resultadoProfesor,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error en POST /visualize:", error.message);
    res.status(500).json({
      error: "No se pudo enviar al profesor",
      mensaje: error.message,
      sugerencia: "Verifica que el servicio del profesor esté activo",
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 GET /data  -> http://localhost:${PORT}/data`);
  console.log(`📤 POST /visualize -> http://localhost:${PORT}/visualize`);
  console.log(`🖥️ Dashboard -> http://localhost:${PORT}/`);
  console.log("💡 Los datos se envían al profesor en Railway");
});
