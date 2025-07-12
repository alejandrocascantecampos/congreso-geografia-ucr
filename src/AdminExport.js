import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const USUARIO_ADMIN = "jornadasdegeografia";   // usuario fijo
const CONTRASENA_ADMIN = "GeoUCR2020!#Congreso"; // contraseña fija
const PREGUNTA_SEGURIDAD = "cuando fue el terremoto de Limon?";
const RESPUESTA_SEGURIDAD = "capibara";

function AdminExport() {
  const [logeado, setLogeado] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [preguntaRespuesta, setPreguntaRespuesta] = useState("");
  const [fasePregunta, setFasePregunta] = useState(false);
  const [inscripciones, setInscripciones] = useState([]);
  const [filtroActividad, setFiltroActividad] = useState("");
  const [filtroCarrera, setFiltroCarrera] = useState("");
  const [filtroAno, setFiltroAno] = useState("");

  // Carga las inscripciones del backend cuando ya está logeado
  useEffect(() => {
    if (!logeado) return;

    async function fetchData() {
      try {
        const response = await fetch("https://congreso-geografia-ucr.onrender.com/inscripciones");
        if (!response.ok) throw new Error("Error al cargar inscripciones");
        const data = await response.json();
        setInscripciones(data);
      } catch (error) {
        alert(error.message);
      }
    }

    fetchData();
  }, [logeado]);

  const inscripcionesFiltradas = inscripciones.filter((insc) => {
    const matchActividad =
      filtroActividad === "" ||
      insc.actividades?.some((act) =>
        act.toLowerCase().includes(filtroActividad.toLowerCase())
      );
    const matchCarrera = filtroCarrera === "" || insc.carrera === filtroCarrera;
    const matchAno = filtroAno === "" || insc.año === filtroAno.toString();
    return matchActividad && matchCarrera && matchAno;
  });

  function manejarLogin(e) {
    e.preventDefault();
    if (usuario === USUARIO_ADMIN && contrasena === CONTRASENA_ADMIN) {
      setFasePregunta(true);
    } else {
      alert("Usuario o contraseña incorrectos");
    }
  }

  function manejarPregunta(e) {
    e.preventDefault();
    if (preguntaRespuesta.trim().toLowerCase() === RESPUESTA_SEGURIDAD) {
      setLogeado(true);
      setFasePregunta(false);
      setUsuario("");
      setContrasena("");
      setPreguntaRespuesta("");
    } else {
      alert("Respuesta de seguridad incorrecta");
    }
  }

  function cerrarSesion() {
    setLogeado(false);
    setUsuario("");
    setContrasena("");
    setPreguntaRespuesta("");
    setFasePregunta(false);
  }

  function descargarCSV() {
    const headers = [
      "Carnet",
      "Nombre",
      "Correo",
      "Carrera",
      "Año",
      "Ponente",
      "Actividades",
    ];
    const rows = inscripcionesFiltradas.map((i) => [
      i.carnet,
      i.nombre,
      i.correo,
      i.carrera,
      i.año,
      i.ponente,
      i.actividades?.join(", "),
    ]);

    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inscripciones.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function descargarPDF() {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Inscripciones Jornadas de Geografía UCR", 14, 20);

    const tableColumn = [
      "Carnet",
      "Nombre",
      "Correo",
      "Carrera",
      "Año",
      "Ponente",
      "Actividades",
    ];
    const tableRows = [];

    inscripcionesFiltradas.forEach((insc) => {
      const inscData = [
        insc.carnet,
        insc.nombre,
        insc.correo,
        insc.carrera,
        insc.año,
        insc.ponente,
        insc.actividades?.join(", "),
      ];
      tableRows.push(inscData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [2, 119, 189] },
    });

    doc.save("inscripciones.pdf");
  }

  if (!logeado && !fasePregunta) {
    return (
      <div
        style={{
          maxWidth: 400,
          margin: "3em auto",
          padding: 20,
          border: "1px solid #0277bd",
          borderRadius: 8,
          backgroundColor: "#e1f5fe",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h2 style={{ textAlign: "center", color: "#0277bd" }}>
          Login Administración
        </h2>
        <form onSubmit={manejarLogin}>
          <label>
            Usuario:
            <input
              required
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 4, marginBottom: 12 }}
              placeholder="Ingrese usuario"
            />
          </label>
          <br />
          <label>
            Contraseña:
            <input
              required
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 4, marginBottom: 12 }}
              placeholder="Ingrese contraseña"
            />
          </label>
          <br />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: 10,
              backgroundColor: "#0277bd",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Entrar
          </button>
        </form>
      </div>
    );
  }

  if (fasePregunta) {
    return (
      <div
        style={{
          maxWidth: 400,
          margin: "3em auto",
          padding: 20,
          border: "1px solid #0277bd",
          borderRadius: 8,
          backgroundColor: "#e1f5fe",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h2 style={{ textAlign: "center", color: "#0277bd" }}>
          Pregunta de Seguridad
        </h2>
        <form onSubmit={manejarPregunta}>
          <p><strong>{PREGUNTA_SEGURIDAD}</strong></p>
          <input
            required
            type="text"
            value={preguntaRespuesta}
            onChange={(e) => setPreguntaRespuesta(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 4, marginBottom: 12 }}
            placeholder="Ingrese la respuesta"
          />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: 10,
              backgroundColor: "#0277bd",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Enviar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "2em auto",
        padding: 20,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ color: "#0277bd", textAlign: "center" }}>
        Panel de Administración - Inscripciones
      </h2>

      <button
        onClick={cerrarSesion}
        style={{
          marginBottom: 20,
          backgroundColor: "#b00020",
          color: "white",
          border: "none",
          borderRadius: 6,
          padding: "8px 15px",
          cursor: "pointer",
          float: "right",
        }}
        title="Cerrar sesión"
      >
        Cerrar sesión
      </button>

      <div
        style={{
          marginBottom: 20,
          display: "flex",
          gap: 15,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <label>
          Filtrar por actividad:
          <input
            type="text"
            value={filtroActividad}
            onChange={(e) => setFiltroActividad(e.target.value)}
            placeholder="Actividad"
            style={{
              marginLeft: 5,
              padding: 6,
              borderRadius: 4,
              border: "1px solid #0277bd",
            }}
          />
        </label>

        <label>
          Filtrar por carrera:
          <select
            value={filtroCarrera}
            onChange={(e) => setFiltroCarrera(e.target.value)}
            style={{
              marginLeft: 5,
              padding: 6,
              borderRadius: 4,
              border: "1px solid #0277bd",
            }}
          >
            <option value="">Todas</option>
            <option value="Geografía">Geografía</option>
            <option value="Estudios Sociales">Estudios Sociales</option>
          </select>
        </label>

        <label>
          Filtrar por año:
          <select
            value={filtroAno}
            onChange={(e) => setFiltroAno(e.target.value)}
            style={{
              marginLeft: 5,
              padding: 6,
              borderRadius: 4,
              border: "1px solid #0277bd",
            }}
          >
            <option value="">Todos</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid #0277bd",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#0277bd", color: "white" }}>
            <th style={{ border: "1px solid #01579b", padding: 8 }}>Carnet</th>
            <th style={{ border: "1px solid #01579b", padding: 8 }}>Nombre</th>
            <th style={{ border: "1px solid #01579b", padding: 8 }}>Correo</th>
            <th style={{ border: "1px solid #01579b", padding: 8 }}>Carrera</th>
            <th style={{ border: "1px solid #01579b", padding: 8 }}>Año</th>
            <th style={{ border: "1px solid #01579b", padding: 8 }}>Ponente</th>
            <th style={{ border: "1px solid #01579b", padding: 8 }}>Actividades</th>
          </tr>
        </thead>
        <tbody>
          {inscripcionesFiltradas.length === 0 && (
            <tr>
              <td colSpan={7} style={{ textAlign: "center", padding: 15 }}>
                No hay inscripciones para mostrar.
              </td>
            </tr>
          )}
          {inscripcionesFiltradas.map((insc) => (
            <tr key={insc.carnet}>
              <td style={{ border: "1px solid #01579b", padding: 8 }}>
                {insc.carnet}
              </td>
              <td style={{ border: "1px solid #01579b", padding: 8 }}>
                {insc.nombre}
              </td>
              <td style={{ border: "1px solid #01579b", padding: 8 }}>
                {insc.correo}
              </td>
              <td style={{ border: "1px solid #01579b", padding: 8 }}>
                {insc.carrera}
              </td>
              <td style={{ border: "1px solid #01579b", padding: 8 }}>{insc.año}</td>
              <td style={{ border: "1px solid #01579b", padding: 8 }}>
                {insc.ponente}
              </td>
              <td style={{ border: "1px solid #01579b", padding: 8 }}>
                {insc.actividades?.join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 20 }}>
        <button
          onClick={descargarCSV}
          style={{
            backgroundColor: "#0277bd",
            color: "white",
            border: "none",
            borderRadius: 6,
            padding: "10px 20px",
            cursor: "pointer",
            marginRight: 10,
          }}
        >
          Descargar CSV
        </button>
        <button
          onClick={descargarPDF}
          style={{
            backgroundColor: "#0288d1",
            color: "white",
            border: "none",
            borderRadius: 6,
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          Descargar PDF
        </button>
      </div>
    </div>
  );
}

export default AdminExport;
