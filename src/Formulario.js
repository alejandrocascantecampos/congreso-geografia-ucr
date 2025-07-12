import React, { useState, useEffect, useMemo } from "react";
import db from "./firebaseConfig";  // Asegúrate que este archivo exporta correctamente la instancia Firestore
import {
  collection,
  addDoc,
  onSnapshot,
  getDocs,
  query,
  where
} from "firebase/firestore";
import jsPDF from "jspdf";

function App() {
  const actividadesDisponibles = [
    "Acto Inaugural",
    "Sesión 1",
    "Sesión 2",
    "Sesión 3",
    "Sesión 4",
    "Sesión 5",
    "Sesión 6",
    "Sesión 7",
    "Sesión 8",
    "Sesión 9",
    "Sesión 10",
    "Sesión 11",
    "Sesión 12",
    "Sesión 13",
    "Sesión 14",
    "Sesión 15",
    "Sesión 16",
    "Sesión 17",
    "Sesión 18",
    "Sesión de Posters",
    "Concurso Estudiantil Geográfico",
    "Acto de Clausura"
  ];

  const capacidadPorActividad = useMemo(() => ({
    "Acto Inaugural": 60,
    "Acto de Clausura": 60,
    "Sesión 1": 34,
    "Sesión 2": 28,
    "Sesión 3": 28,
    "Sesión 4": 34,
    "Sesión 5": 28,
    "Sesión 6": 28,
    "Sesión 7": 34,
    "Sesión 8": 28,
    "Sesión 9": 28,
    "Sesión 10": 34,
    "Sesión 11": 28,
    "Sesión 12": 28,
    "Sesión 13": 34,
    "Sesión 14": 34,
    "Sesión 15": 28,
    "Sesión 16": 28,
    "Sesión 17": 28,
    "Sesión 18": 28,
    "Sesión de Posters": 40,
    "Concurso Estudiantil Geográfico": 50
  }), []);

  const [formData, setFormData] = useState({
    carnet: "",
    nombre: "",
    correo: "",
    carrera: "",
    año: "",
    ponente: "No",
    actividades: []
  });

  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
  const [resumen, setResumen] = useState(null);
  const [cuposRestantes, setCuposRestantes] = useState({});
  const [mostrarBotonDescarga, setMostrarBotonDescarga] = useState(false);
  const [mostrarMensajeExito, setMostrarMensajeExito] = useState(false);

  const maxActividades = () => {
    if (formData.ponente === "Sí") return 2;
    if (formData.carrera === "Geografía" && formData.año === "1") return 1;
    if (formData.carrera === "Geografía" && formData.año !== "1") return 2;
    if (formData.carrera === "Estudios Sociales") return 2;
    return 2;
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "inscripciones"), (snapshot) => {
      const conteo = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (Array.isArray(data.actividades)) {
          data.actividades.forEach((act) => {
            conteo[act] = (conteo[act] || 0) + 1;
          });
        }
      });

      const disponibles = {};
      for (const actividad in capacidadPorActividad) {
        disponibles[actividad] = capacidadPorActividad[actividad] - (conteo[actividad] || 0);
      }
      setCuposRestantes(disponibles);
    });

    return () => unsubscribe();
  }, [capacidadPorActividad]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(old => ({ ...old, [name]: value }));
  }

  function handleCheckboxChange(e) {
    const { value, checked } = e.target;
    let nuevasActividades = [...formData.actividades];
    if (checked) {
      if (!nuevasActividades.includes(value)) {
        nuevasActividades.push(value);
      }
    } else {
      nuevasActividades = nuevasActividades.filter(a => a !== value);
    }

    const max = maxActividades();
    if (nuevasActividades.length > max) {
      setMensaje({ tipo: "error", texto: `Debe seleccionar máximo ${max} actividad(es) según su perfil.` });
      return; // No actualizar si supera
    }
    setMensaje({ tipo: "", texto: "" });
    setFormData(old => ({ ...old, actividades: nuevasActividades }));
  }

  async function validarCarnetUnico(carnet) {
    if (!carnet) return true;
    const q = query(collection(db, "inscripciones"), where("carnet", "==", carnet));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      setMensaje({ tipo: "error", texto: `El carné ${carnet} ya fue registrado.` });
      return false;
    }
    return true;
  }

  function validarSeleccion() {
    const { carrera, año, ponente, actividades } = formData;
    const numActividades = actividades.length;

    if (carrera === "Geografía" && año === "1") {
      const invalidas = actividades.filter(a =>
        ["Acto de Clausura", "Sesión de Posters", "Concurso Estudiantil Geográfico"].includes(a)
      );
      if (invalidas.length > 0) {
        setMensaje({ tipo: "error", texto: "Estudiantes de primer año de Geografía no pueden inscribirse en esas actividades." });
        return false;
      }
      if (numActividades !== 1) {
        setMensaje({ tipo: "error", texto: "Estudiantes de primer año de Geografía deben inscribirse en una sola actividad." });
        return false;
      }
    }

    if (carrera === "Estudios Sociales") {
      const invalidas = actividades.filter(a =>
        ["Sesión de Posters", "Concurso Estudiantil Geográfico"].includes(a)
      );
      if (invalidas.length > 0) {
        setMensaje({ tipo: "error", texto: "Estudiantes de Estudios Sociales no pueden inscribirse en Sesión de Posters ni Concurso Estudiantil Geográfico." });
        return false;
      }
      if (numActividades < 1) {
        setMensaje({ tipo: "error", texto: "Debe inscribirse en al menos una actividad." });
        return false;
      }
    }

    if (ponente === "Sí" && numActividades > 2) {
      setMensaje({ tipo: "error", texto: "Ponentes pueden seleccionar máximo dos actividades (la segunda es opcional)." });
      return false;
    }

    if (carrera === "Geografía" && año !== "1" && ponente === "No" && numActividades < 2) {
      setMensaje({ tipo: "error", texto: "Estudiantes de Geografía de años superiores deben inscribirse en al menos dos actividades." });
      return false;
    }

    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validarSeleccion()) return;

    const carnetValido = await validarCarnetUnico(formData.carnet);
    if (!carnetValido) return;

    for (const act of formData.actividades) {
      if (!cuposRestantes[act] || cuposRestantes[act] <= 0) {
        setMensaje({ tipo: "error", texto: `La actividad "${act}" ya no tiene cupo.` });
        return;
      }
    }

    if (!window.confirm("¿Desea guardar su inscripción?")) return;

    try {
      await addDoc(collection(db, "inscripciones"), formData);
      setMensaje({ tipo: "exito", texto: "¡Inscripción exitosa!" });
      setResumen(formData);
      setMostrarBotonDescarga(true);
      setMostrarMensajeExito(true);

      guardarComoPDF(formData); // descarga automática

      setFormData({
        carnet: "",
        nombre: "",
        correo: "",
        carrera: "",
        año: "",
        ponente: "No",
        actividades: []
      });

      setTimeout(() => setMostrarMensajeExito(false), 5000);
    } catch (error) {
      setMensaje({ tipo: "error", texto: "Error al enviar: " + error.message });
    }
  }

  function guardarComoPDF(data) {
    if (!data) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Resumen de inscripción", 14, 20);

    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleString()}`, 14, 30);

    doc.setLineWidth(0.5);
    doc.line(14, 33, 196, 33);

    let y = 40;
    doc.text(`Carné: ${data.carnet}`, 14, y);
    y += 10;
    doc.text(`Nombre: ${data.nombre}`, 14, y);
    y += 10;
    doc.text(`Correo: ${data.correo}`, 14, y);
    y += 10;
    doc.text(`Carrera: ${data.carrera}`, 14, y);
    y += 10;
    doc.text(`Año: ${data.año}`, 14, y);
    y += 10;
    doc.text(`Ponente: ${data.ponente}`, 14, y);
    y += 10;
    doc.text(`Actividades seleccionadas:`, 14, y);
    y += 8;
    data.actividades.forEach((act, i) => {
      doc.text(`${i + 1}. ${act}`, 18, y);
      y += 8;
    });

    doc.save(`Inscripcion_${data.carnet}.pdf`);
  }

  function descargarResumenTXT() {
    if (!resumen) return;
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(resumen, null, 2)], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `Inscripcion_${resumen.carnet}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  function actividadesFiltradas() {
    return actividadesDisponibles.filter((act) => {
      if (formData.carrera === "") return true;
      if (formData.carrera === "Geografía" && formData.año === "1") {
        if (["Acto de Clausura", "Sesión de Posters", "Concurso Estudiantil Geográfico"].includes(act)) return false;
      }
      if (formData.carrera === "Estudios Sociales") {
        if (["Sesión de Posters", "Concurso Estudiantil Geográfico"].includes(act)) return false;
      }
      return true;
    });
  }

  return (
    <>
      <style>{`
        body, html, #root {
          height: 100%;
          margin: 0;
          font-family: Arial, sans-serif;
          background: #e1f5fe;
        }
        .checkbox-list {
          max-height: 150px;
          overflow-y: auto;
          border: 1px solid #0277bd;
          border-radius: 4px;
          padding: 10px;
          background-color: white;
        }
        .checkbox-list label {
          display: block;
          margin-bottom: 6px;
          cursor: pointer;
        }
        @media (max-width: 600px) {
          div.form-container {
            padding: 10px;
            max-width: 95%;
          }
          button {
            width: 100%;
            font-size: 1.1em;
          }
        }
        .mensaje-error {
          color: #b00020;
          font-weight: bold;
          margin: 10px 0;
        }
        .mensaje-exito {
          color: #2e7d32;
          font-weight: bold;
          margin: 10px 0;
        }
        .btn {
          padding: 12px 20px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          margin-top: 15px;
        }
        .btn-primary {
          background-color: #0277bd;
          color: white;
        }
        .btn-secondary {
          background-color: #0288d1;
          color: white;
          margin-left: 10px;
        }
        div.form-container {
          padding: 20px;
          max-width: 600px;
          margin: auto;
          background-color: #e1f5fe;
          border-radius: 12px;
          box-shadow: 0 0 10px #81d4fa;
        }
      `}</style>

      <div className="form-container">
        <h2 style={{ color: "#0277bd", textAlign: "center" }}>Inscripción Jornadas de Geografía UCR</h2>
        <p style={{ backgroundColor: "#b3e5fc", padding: 10, borderRadius: 6, fontWeight: "bold", color: "#01579b" }}>
          Este es el formulario de inscripción a las actividades de las Jornadas de Geografía de la Universidad de Costa Rica. <br />
          <strong>Sólo debe llenarse una vez.</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <label>Carné:<br />
            <input
              required
              name="carnet"
              value={formData.carnet}
              onChange={handleChange}
              style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #0277bd" }}
              placeholder="Ingrese su carné"
            />
          </label><br /><br />

          <label>Nombre completo:<br />
            <input
              required
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #0277bd" }}
              placeholder="Ingrese su nombre completo"
            />
          </label><br /><br />

          <label>Correo electrónico:<br />
            <input
              required
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #0277bd" }}
              placeholder="ejemplo@correo.com"
            />
          </label><br /><br />

          <label>Carrera:<br />
            <select
              required
              name="carrera"
              value={formData.carrera}
              onChange={handleChange}
              style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #0277bd" }}
            >
              <option value="">--Seleccione--</option>
              <option value="Geografía">Geografía</option>
              <option value="Estudios Sociales">Estudios Sociales</option>
            </select>
          </label><br /><br />

          <label>Año en el que está cursando la Carrera:<br />
            <select
              required
              name="año"
              value={formData.año}
              onChange={handleChange}
              style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #0277bd" }}
            >
              <option value="">--Seleccione--</option>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
            </select><br />
            <small style={{ color: "#01579b" }}>
              Si está entre dos niveles, marque el año en el que lleva más cursos de Carrera.
            </small>
          </label><br /><br />

          <label>¿Es usted estudiante ponente?<br />
            <select
              required
              name="ponente"
              value={formData.ponente}
              onChange={handleChange}
              style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #0277bd" }}
            >
              <option value="No">No</option>
              <option value="Sí">Sí</option>
            </select>
          </label><br /><br />

          <label style={{ fontWeight: "bold" }}>
            Seleccione únicamente las actividades en las que va a participar. <br />
            Seleccione la cantidad que le corresponde según su perfil.
          </label><br />

          <div className="checkbox-list" role="group" aria-label="Actividades">
            {actividadesFiltradas().map((actividad) => (
              <label key={actividad}>
                <input
                  type="checkbox"
                  value={actividad}
                  checked={formData.actividades.includes(actividad)}
                  onChange={handleCheckboxChange}
                  disabled={cuposRestantes[actividad] <= 0}
                />
                {` ${actividad} (${cuposRestantes[actividad] ?? capacidadPorActividad[actividad]} cupos restantes)`}
              </label>
            ))}
          </div><br />

          <button type="submit" className="btn btn-primary">Enviar inscripción</button>
        </form>

        {mensaje.texto && (
          <div className={mensaje.tipo === "error" ? "mensaje-error" : "mensaje-exito"}>
            {mensaje.texto}
          </div>
        )}

        {mostrarMensajeExito && (
          <div className="mensaje-exito" style={{ marginTop: 10 }}>
            ¡Su formulario fue enviado exitosamente!
          </div>
        )}

        {mostrarBotonDescarga && (
          <div style={{ marginTop: 15 }}>
            <button className="btn btn-primary" onClick={() => guardarComoPDF(resumen)}>Descargar resumen en PDF</button>
            <button className="btn btn-secondary" onClick={descargarResumenTXT}>Descargar resumen en TXT</button>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
