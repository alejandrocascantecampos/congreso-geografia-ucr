import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import App from "./App";
import AdminExport from "./AdminExport";

function MainRouter() {
  return (
    <Router>
      <nav style={{
        padding: "1em",
        backgroundColor: "#0277bd",
        color: "white",
        display: "flex",
        gap: "1em"
      }}>
        <Link to="/" style={{ color: "white", textDecoration: "none" }}>
          Formulario Inscripción
        </Link>
        <Link to="/admin" style={{ color: "white", textDecoration: "none" }}>
          Panel Administración
        </Link>
      </nav>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<AdminExport />} />
      </Routes>
    </Router>
  );
}

export default MainRouter;
