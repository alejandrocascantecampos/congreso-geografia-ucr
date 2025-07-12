import React, { useEffect } from "react";

export default function Toast({ tipo, texto, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colores = {
    exito: "#2e7d32",
    error: "#b00020",
    info: "#0277bd",
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        backgroundColor: colores[tipo] || "#333",
        color: "white",
        padding: "12px 20px",
        borderRadius: 8,
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        zIndex: 1000,
        minWidth: 250,
      }}
    >
      {texto}
    </div>
  );
}
