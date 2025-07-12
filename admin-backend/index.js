// index.js
const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const cors = require("cors");

const app = express();
app.use(cors()); // permite llamadas desde el frontend

// Configuración de Supabase con clave secreta (solo backend)
const supabase = createClient(
  "https://ssadfbndvcckdxoybotm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzYWRmYm5kdmNja2R4b3lib3RtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjI0MjcwMSwiZXhwIjoyMDY3ODE4NzAxfQ.aZ49ExVpcT-wPc68WXbp-_-nQMXGOT4EVrJwIWFnwuI"
);

// Ruta básica de prueba
app.get("/", (req, res) => {
  res.send("🚀 Backend del Congreso de Geografía está funcionando correctamente.");
});

// Ruta protegida para obtener inscripciones
app.get("/inscripciones", async (req, res) => {
  const { data, error } = await supabase.from("inscripciones").select("*");

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// Puerto de ejecución
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor backend corriendo en http://localhost:${PORT}`);
});
