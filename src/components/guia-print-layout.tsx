"use client";

import { useEffect, useState } from "react";
import * as QRCode from "qrcode";

export interface GuiaPrintData {
  id: string;
  folio: string;
  estado: string;
  pesoKg: string | number;
  piezas: number;
  tipoContenido?: string | null;
  numeroCuenta?: string | null;
  recolectadoPor?: string | null;
  recibidoPor?: string | null;
  comentarios?: string | null;
  createdAt: string;
  remitente: {
    nombre: string;
    calle: string;
    numExt: string;
    numInt?: string | null;
    colonia: string;
    municipio: string;
    estado: string;
    cp: string;
    telefono: string;
    email?: string | null;
  };
  consignatario: {
    nombre: string;
    calle: string;
    numExt: string;
    numInt?: string | null;
    colonia: string;
    municipio: string;
    estado: string;
    cp: string;
    telefono: string;
    email?: string | null;
  };
}

interface GuiaPrintLayoutProps {
  guia: GuiaPrintData;
}

function formatDireccion(d: GuiaPrintData["remitente"]): string {
  const num = d.numInt ? `${d.numExt} Int. ${d.numInt}` : d.numExt;
  return `${d.calle} ${num}`;
}

function formatCiudadEstado(d: GuiaPrintData["remitente"]): string {
  return `${d.municipio}, ${d.estado}`;
}

function formatFecha(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export function GuiaPrintLayout({ guia }: GuiaPrintLayoutProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://salter.com.mx";
    const trackingUrl = `${baseUrl}/rastreo?folio=${encodeURIComponent(guia.folio)}`;
    QRCode.toDataURL(trackingUrl, { width: 120, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [guia.folio]);

  return (
    <div style={{ width: "100%", maxWidth: "700px", margin: "0 auto", fontFamily: "Arial, Helvetica, sans-serif", fontSize: "12px", color: "#000", backgroundColor: "#e8f4f8", border: "2px solid #2a7f8f", borderRadius: "4px", padding: "16px", boxSizing: "border-box", pageBreakInside: "avoid" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #2a7f8f", paddingBottom: "8px", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "48px", height: "48px", backgroundColor: "#2a7f8f", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "14px", borderRadius: "4px", flexShrink: 0 }}>GF</div>
          <div>
            <div style={{ fontWeight: "bold", fontSize: "16px", color: "#2a7f8f" }}>SALTER</div>
            <div style={{ fontSize: "11px", color: "#555" }}>Mensajería y Paquetería</div>
          </div>
        </div>
      </div>
      {/* Info row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px", marginBottom: "12px", borderBottom: "1px solid #b0d4db", paddingBottom: "10px" }}>
        <div><div style={{ fontWeight: "bold", fontSize: "10px", color: "#555", textTransform: "uppercase" }}>Origen</div><div>{formatCiudadEstado(guia.remitente)}</div></div>
        <div><div style={{ fontWeight: "bold", fontSize: "10px", color: "#555", textTransform: "uppercase" }}>No. De Cuenta</div><div>{guia.numeroCuenta || "—"}</div></div>
        <div><div style={{ fontWeight: "bold", fontSize: "10px", color: "#555", textTransform: "uppercase" }}>Peso</div><div>{guia.pesoKg} kg</div></div>
        <div><div style={{ fontWeight: "bold", fontSize: "10px", color: "#555", textTransform: "uppercase" }}>Piezas</div><div>{guia.piezas}</div></div>
      </div>
      {/* Folio + QR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid #b0d4db", paddingBottom: "10px" }}>
        <div><div style={{ fontWeight: "bold", fontSize: "10px", color: "#555", textTransform: "uppercase" }}>Folio</div><div style={{ fontWeight: "bold", fontSize: "18px", color: "#2a7f8f" }}>{guia.folio}</div></div>
        {qrDataUrl && <img src={qrDataUrl} alt={`QR ${guia.folio}`} style={{ width: "100px", height: "100px" }} />}
      </div>
      {/* Remitente */}
      <div style={{ border: "1px solid #2a7f8f", borderRadius: "3px", padding: "10px", marginBottom: "10px", backgroundColor: "#f0f9fb" }}>
        <div style={{ fontWeight: "bold", fontSize: "11px", color: "#2a7f8f", textTransform: "uppercase", marginBottom: "6px", borderBottom: "1px solid #b0d4db", paddingBottom: "4px" }}>Remitente</div>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "2px 10px" }}>
          <span style={{ fontWeight: "bold", fontSize: "11px" }}>Nombre:</span><span>{guia.remitente.nombre}</span>
          <span style={{ fontWeight: "bold", fontSize: "11px" }}>Dirección:</span><span>{formatDireccion(guia.remitente)}</span>
          <span style={{ fontWeight: "bold", fontSize: "11px" }}>Colonia:</span><span>{guia.remitente.colonia}</span>
          <span style={{ fontWeight: "bold", fontSize: "11px" }}>Ciudad y Estado:</span><span>{formatCiudadEstado(guia.remitente)}</span>
          <span style={{ fontWeight: "bold", fontSize: "11px" }}>Teléfono:</span><span>{guia.remitente.telefono}</span>
        </div>
      </div>
      {/* Consignatario */}
      <div style={{ border: "1px solid #2a7f8f", borderRadius: "3px", padding: "10px", marginBottom: "10px", backgroundColor: "#f0f9fb" }}>
        <div style={{ fontWeight: "bold", fontSize: "11px", color: "#2a7f8f", textTransform: "uppercase", marginBottom: "6px", borderBottom: "1px solid #b0d4db", paddingBottom: "4px" }}>Consignatario</div>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "2px 10px" }}>
          <span style={{ fontWeight: "bold", fontSize: "11px" }}>Nombre:</span><span>{guia.consignatario.nombre}</span>
          <span style={{ fontWeight: "bold", fontSize: "11px" }}>Dirección:</span><span>{formatDireccion(guia.consignatario)}</span>
          <span style={{ fontWeight: "bold", fontSize: "11px" }}>Colonia:</span><span>{guia.consignatario.colonia}</span>
          <span style={{ fontWeight: "bold", fontSize: "11px" }}>Ciudad y Estado:</span><span>{formatCiudadEstado(guia.consignatario)}</span>
          <span style={{ fontWeight: "bold", fontSize: "11px" }}>C.P.:</span><span>{guia.consignatario.cp}</span>
          <span style={{ fontWeight: "bold", fontSize: "11px" }}>Teléfono:</span><span>{guia.consignatario.telefono}</span>
        </div>
      </div>
      {/* Footer */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", borderTop: "1px solid #b0d4db", paddingTop: "10px" }}>
        <div><div style={{ fontWeight: "bold", fontSize: "10px", color: "#555", textTransform: "uppercase" }}>Fecha</div><div>{formatFecha(guia.createdAt)}</div></div>
        <div><div style={{ fontWeight: "bold", fontSize: "10px", color: "#555", textTransform: "uppercase" }}>Recolectado por</div><div>{guia.recolectadoPor || "_______________"}</div></div>
        <div><div style={{ fontWeight: "bold", fontSize: "10px", color: "#555", textTransform: "uppercase" }}>Recibido</div><div>{guia.recibidoPor || "_______________"}</div></div>
      </div>
    </div>
  );
}
