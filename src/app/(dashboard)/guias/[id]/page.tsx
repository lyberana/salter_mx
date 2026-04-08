"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { GuiaPrintPreview } from "@/components/guia-print-preview";
import type { GuiaPrintData } from "@/components/guia-print-layout";
import { useBreadcrumbOverrides } from "@/lib/context/breadcrumb-context";

type EstadoGuia = "creada" | "en_ruta" | "completada" | "cancelada";

interface GuiaDetail {
  id: string;
  folio: string;
  estado: EstadoGuia;
  pesoKg: string;
  piezas: number;
  tipoContenido: string | null;
  numeroCuenta: string | null;
  recolectadoPor: string | null;
  recibidoPor: string | null;
  comentarios: string | null;
  createdAt: string;
  updatedAt: string;
  remitente: {
    id: string;
    nombre: string;
    rfc: string;
    calle: string;
    numExt: string;
    numInt: string | null;
    colonia: string;
    municipio: string;
    estado: string;
    cp: string;
    telefono: string;
    email: string | null;
  };
  consignatario: {
    id: string;
    nombre: string;
    rfc: string;
    calle: string;
    numExt: string;
    numInt: string | null;
    colonia: string;
    municipio: string;
    estado: string;
    cp: string;
    telefono: string;
    email: string | null;
  };
}

const estadoBadgeClasses: Record<EstadoGuia, string> = {
  creada: "bg-blue-50 text-blue-700",
  en_ruta: "bg-amber-50 text-amber-700",
  completada: "bg-green-50 text-green-700",
  cancelada: "bg-red-50 text-red-600",
};

const estadoLabels: Record<EstadoGuia, string> = {
  creada: "Creada",
  en_ruta: "En ruta",
  completada: "Completada",
  cancelada: "Cancelada",
};

function formatDireccion(d: { calle: string; numExt: string; numInt: string | null }) {
  return d.numInt ? `${d.calle} ${d.numExt} Int. ${d.numInt}` : `${d.calle} ${d.numExt}`;
}

export default function GuiaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const { setOverride } = useBreadcrumbOverrides();
  const [guia, setGuia] = useState<GuiaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [printOpen, setPrintOpen] = useState(false);
  const [changingEstado, setChangingEstado] = useState(false);

  const isCoordinador = (session?.user as any)?.role === "coordinador";

  useEffect(() => {
    fetchGuia();
  }, [id]);

  // Update breadcrumb with folio when guia loads
  useEffect(() => {
    if (guia?.folio) {
      setOverride(id, guia.folio);
    }
  }, [guia?.folio, id, setOverride]);

  async function fetchGuia() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/v1/guias/${id}`);
      if (!res.ok) {
        setError("Guía no encontrada");
        return;
      }
      const json = await res.json();
      setGuia(json.data);
    } catch {
      setError("Error al cargar la guía");
    } finally {
      setLoading(false);
    }
  }

  async function handleEstadoChange(nuevoEstado: EstadoGuia) {
    if (!guia || changingEstado) return;
    setChangingEstado(true);
    try {
      const res = await fetch(`/api/v1/guias/${guia.id}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (res.ok) {
        const json = await res.json();
        setGuia((prev) => prev ? { ...prev, estado: json.data.estado, updatedAt: json.data.updatedAt } : prev);
      }
    } catch {
      // silently fail
    } finally {
      setChangingEstado(false);
    }
  }

  if (loading) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-[#8A96A8]">Cargando guía...</p>
      </div>
    );
  }

  if (error || !guia) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-[#4A5568] mb-2">{error || "Guía no encontrada"}</p>
        <Link href="/guias" className="text-sm text-[#E85D04] hover:underline">
          ← Volver a guías
        </Link>
      </div>
    );
  }

  const allActions: { label: string; value: EstadoGuia }[] = [
    { label: "En Ruta", value: "en_ruta" as const },
    { label: "Completada", value: "completada" as const },
    { label: "Cancelada", value: "cancelada" as const },
  ];
  const estadoActions = allActions.filter((a) => a.value !== guia.estado);

  const printData: GuiaPrintData = {
    id: guia.id,
    folio: guia.folio,
    estado: guia.estado,
    pesoKg: guia.pesoKg,
    piezas: guia.piezas,
    tipoContenido: guia.tipoContenido,
    numeroCuenta: guia.numeroCuenta,
    recolectadoPor: guia.recolectadoPor,
    recibidoPor: guia.recibidoPor,
    comentarios: guia.comentarios,
    createdAt: guia.createdAt,
    remitente: guia.remitente,
    consignatario: guia.consignatario,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-[#0F1F3D] font-mono">
            {guia.folio}
          </h1>
          <span
            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoBadgeClasses[guia.estado]}`}
          >
            {estadoLabels[guia.estado]}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPrintOpen(true)}
            className="inline-flex items-center justify-center h-9 px-4 rounded-md bg-[#0F1F3D] text-white text-sm font-medium hover:bg-[#1A3260] transition-colors"
          >
            Imprimir
          </button>
          <Link
            href="/guias"
            className="text-sm text-[#4A5568] hover:text-[#0F1F3D]"
          >
            ← Volver a guías
          </Link>
        </div>
      </div>

      {/* Guía details */}
      <div className="bg-white rounded-lg border border-[#DDE3EC] p-6 mb-6">
        <h2 className="text-sm font-semibold text-[#0F1F3D] mb-4">Datos de la guía</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <dt className="text-xs text-[#8A96A8]">Folio</dt>
            <dd className="text-sm text-[#0F1F3D] mt-0.5 font-mono">{guia.folio}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#8A96A8]">Estado</dt>
            <dd className="text-sm mt-0.5">
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${estadoBadgeClasses[guia.estado]}`}>
                {estadoLabels[guia.estado]}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[#8A96A8]">Peso (kg)</dt>
            <dd className="text-sm text-[#0F1F3D] mt-0.5">{guia.pesoKg}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#8A96A8]">Piezas</dt>
            <dd className="text-sm text-[#0F1F3D] mt-0.5">{guia.piezas}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#8A96A8]">Tipo de Contenido</dt>
            <dd className="text-sm text-[#0F1F3D] mt-0.5">{guia.tipoContenido || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#8A96A8]">Número de Cuenta</dt>
            <dd className="text-sm text-[#0F1F3D] mt-0.5">{guia.numeroCuenta || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#8A96A8]">Fecha de Creación</dt>
            <dd className="text-sm text-[#0F1F3D] mt-0.5">{new Date(guia.createdAt).toLocaleString("es-MX")}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#8A96A8]">Última Actualización</dt>
            <dd className="text-sm text-[#0F1F3D] mt-0.5">{new Date(guia.updatedAt).toLocaleString("es-MX")}</dd>
          </div>
          {guia.comentarios && (
            <div className="sm:col-span-2">
              <dt className="text-xs text-[#8A96A8]">Comentarios</dt>
              <dd className="text-sm text-[#0F1F3D] mt-0.5">{guia.comentarios}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Remitente */}
      <div className="bg-white rounded-lg border border-[#DDE3EC] p-6 mb-6">
        <h2 className="text-sm font-semibold text-[#0F1F3D] mb-4">Remitente</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <dt className="text-xs text-[#8A96A8]">Nombre</dt>
            <dd className="text-sm text-[#0F1F3D] mt-0.5">{guia.remitente.nombre}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#8A96A8]">RFC</dt>
            <dd className="text-sm text-[#0F1F3D] mt-0.5">{guia.remitente.rfc}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#8A96A8]">Dirección</dt>
            <dd className="text-sm text-[#0F1F3D] mt-0.5">{formatDireccion(guia.remitente)}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#8A96A8]">Colonia</dt>
            <dd className="text-sm text-[#0F1F3D] mt-0.5">{guia.remitente.colonia}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#8A96A8]">Municipio, Estado</dt>
            <dd className="text-sm text-[#0F1F3D] mt-0.5">{guia.remitente.municipio}, {guia.remitente.estado}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#8A96A8]">C.P.</dt>
            <dd className="text-sm text-[#0F1F3D] mt-0.5">{guia.remitente.cp}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#8A96A8]">Teléfono</dt>
            <dd className="text-sm text-[#0F1F3D] mt-0.5">{guia.remitente.telefono}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#8A96A8]">Email</dt>
            <dd className="text-sm text-[#0F1F3D] mt-0.5">{guia.remitente.email || "—"}</dd>
          </div>
        </dl>
      </div>

      {/* Consignatario */}
      <div className="bg-white rounded-lg border border-[#DDE3EC] p-6 mb-6">
        <h2 className="text-sm font-semibold text-[#0F1F3D] mb-4">Consignatario</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <dt className="text-xs text-[#8A96A8]">Nombre</dt>
            <dd className="text-sm text-[#0F1F3D] mt-0.5">{guia.consignatario.nombre}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#8A96A8]">RFC</dt>
            <dd className="text-sm text-[#0F1F3D] mt-0.5">{guia.consignatario.rfc}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#8A96A8]">Dirección</dt>
            <dd className="text-sm text-[#0F1F3D] mt-0.5">{formatDireccion(guia.consignatario)}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#8A96A8]">Colonia</dt>
            <dd className="text-sm text-[#0F1F3D] mt-0.5">{guia.consignatario.colonia}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#8A96A8]">Municipio, Estado</dt>
            <dd className="text-sm text-[#0F1F3D] mt-0.5">{guia.consignatario.municipio}, {guia.consignatario.estado}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#8A96A8]">C.P.</dt>
            <dd className="text-sm text-[#0F1F3D] mt-0.5">{guia.consignatario.cp}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#8A96A8]">Teléfono</dt>
            <dd className="text-sm text-[#0F1F3D] mt-0.5">{guia.consignatario.telefono}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#8A96A8]">Email</dt>
            <dd className="text-sm text-[#0F1F3D] mt-0.5">{guia.consignatario.email || "—"}</dd>
          </div>
        </dl>
      </div>

      {/* Estado change actions */}
      {isCoordinador && estadoActions.length > 0 && (
        <div className="bg-white rounded-lg border border-[#DDE3EC] p-6">
          <h2 className="text-sm font-semibold text-[#0F1F3D] mb-4">Cambiar estado</h2>
          <div className="flex gap-3">
            {estadoActions.map((action) => (
              <button
                key={action.value}
                onClick={() => handleEstadoChange(action.value)}
                disabled={changingEstado}
                className="inline-flex items-center justify-center h-9 px-4 rounded-md border border-[#DDE3EC] text-sm font-medium text-[#0F1F3D] hover:bg-[#F8F9FB] transition-colors disabled:opacity-50"
              >
                {changingEstado ? "Cambiando..." : action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <GuiaPrintPreview
        open={printOpen}
        onOpenChange={setPrintOpen}
        guia={printData}
      />
    </div>
  );
}
