"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const TABS = ["Vehículos", "Operadores"] as const;

const ESTADO_VEHICULO_STYLES: Record<string, string> = {
  disponible: "bg-green-50 text-green-700",
  en_ruta: "bg-amber-50 text-amber-700",
  en_mantenimiento: "bg-orange-50 text-orange-700",
  inactivo: "bg-slate-50 text-slate-500",
};

const ESTADO_VEHICULO_LABELS: Record<string, string> = {
  disponible: "Disponible",
  en_ruta: "En ruta",
  en_mantenimiento: "En mantenimiento",
  inactivo: "Inactivo",
};

function isLicenseExpiringSoon(dateStr: string): boolean {
  const vence = new Date(dateStr);
  const now = new Date();
  const diffMs = vence.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= 30;
}

export default function FlotaPage() {
  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]>("Vehículos");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[#0F1F3D]">Flota</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[#DDE3EC]">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-[#E85D04] text-[#E85D04]"
                : "border-transparent text-[#8A96A8] hover:text-[#4A5568]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Vehículos" && <VehiculosTab />}
      {activeTab === "Operadores" && <OperadoresTab />}
    </div>
  );
}

function VehiculosTab() {
  // Placeholder — will fetch from API
  const vehiculos: {
    id: string;
    placa: string;
    numeroEconomico: string;
    tipo: string;
    capacidadKg: number;
    estado: string;
    anioModelo: number;
  }[] = [];

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button className="bg-[#E85D04] hover:bg-[#F48C06] text-white text-sm">
          + Nuevo Vehículo
        </Button>
      </div>
      <div className="bg-white rounded-lg border border-[#DDE3EC] overflow-hidden">
        {vehiculos.length === 0 ? (
          <div className="py-12 text-center text-[#4A5568]">
            <p>No hay vehículos registrados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#DDE3EC] bg-[#F8F9FB]">
                <th className="text-left px-4 py-3 font-medium text-[#4A5568]">
                  Placa
                </th>
                <th className="text-left px-4 py-3 font-medium text-[#4A5568]">
                  Núm. Económico
                </th>
                <th className="text-left px-4 py-3 font-medium text-[#4A5568]">
                  Tipo
                </th>
                <th className="text-left px-4 py-3 font-medium text-[#4A5568]">
                  Capacidad (kg)
                </th>
                <th className="text-left px-4 py-3 font-medium text-[#4A5568]">
                  Estado
                </th>
                <th className="text-left px-4 py-3 font-medium text-[#4A5568]">
                  Año
                </th>
              </tr>
            </thead>
            <tbody>
              {vehiculos.map((v) => (
                <tr
                  key={v.id}
                  className="border-b border-[#DDE3EC] hover:bg-[#F8F9FB]"
                >
                  <td className="px-4 py-3 font-mono">{v.placa}</td>
                  <td className="px-4 py-3">{v.numeroEconomico}</td>
                  <td className="px-4 py-3">{v.tipo}</td>
                  <td className="px-4 py-3">
                    {v.capacidadKg.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        ESTADO_VEHICULO_STYLES[v.estado] ?? ""
                      }`}
                    >
                      {ESTADO_VEHICULO_LABELS[v.estado] ?? v.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3">{v.anioModelo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function OperadoresTab() {
  // Placeholder — will fetch from API
  const operadores: {
    id: string;
    nombre: string;
    curp: string;
    licenciaNum: string;
    licenciaVence: string;
    telefono: string;
    activo: boolean;
  }[] = [];

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button className="bg-[#E85D04] hover:bg-[#F48C06] text-white text-sm">
          + Nuevo Operador
        </Button>
      </div>
      <div className="bg-white rounded-lg border border-[#DDE3EC] overflow-hidden">
        {operadores.length === 0 ? (
          <div className="py-12 text-center text-[#4A5568]">
            <p>No hay operadores registrados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#DDE3EC] bg-[#F8F9FB]">
                <th className="text-left px-4 py-3 font-medium text-[#4A5568]">
                  Nombre
                </th>
                <th className="text-left px-4 py-3 font-medium text-[#4A5568]">
                  CURP
                </th>
                <th className="text-left px-4 py-3 font-medium text-[#4A5568]">
                  Licencia
                </th>
                <th className="text-left px-4 py-3 font-medium text-[#4A5568]">
                  Vence
                </th>
                <th className="text-left px-4 py-3 font-medium text-[#4A5568]">
                  Teléfono
                </th>
                <th className="text-left px-4 py-3 font-medium text-[#4A5568]">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {operadores.map((op) => {
                const expiringSoon = isLicenseExpiringSoon(op.licenciaVence);
                return (
                  <tr
                    key={op.id}
                    className={`border-b border-[#DDE3EC] ${
                      expiringSoon
                        ? "bg-red-50"
                        : "hover:bg-[#F8F9FB]"
                    }`}
                  >
                    <td className="px-4 py-3">{op.nombre}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {op.curp}
                    </td>
                    <td className="px-4 py-3">{op.licenciaNum}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1">
                        {expiringSoon && (
                          <svg
                            className="w-4 h-4 text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        )}
                        <span className={expiringSoon ? "text-red-700 font-medium" : ""}>
                          {op.licenciaVence}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3">{op.telefono}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          op.activo
                            ? "bg-green-50 text-green-700"
                            : "bg-slate-50 text-slate-500"
                        }`}
                      >
                        {op.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
