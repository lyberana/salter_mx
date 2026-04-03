"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const ENTIDADES = [
  { value: "remitentes", label: "Remitentes" },
  { value: "consignatarios", label: "Consignatarios" },
  { value: "envios", label: "Envíos" },
];

export default function ImportacionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [entidad, setEntidad] = useState("remitentes");
  const [dryRun, setDryRun] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ id: string; estado: string; dryRun: boolean } | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("entidad", entidad);
    formData.append("dryRun", String(dryRun));

    try {
      const res = await fetch("/api/v1/importacion", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) {
        setError(json.errors?.[0]?.message ?? "Error");
        return;
      }
      setResult(json.data);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-[#0F1F3D] mb-2">Importación Masiva</h1>
      <p className="text-sm text-[#4A5568] mb-6">
        Importa remitentes, consignatarios o envíos desde archivos CSV o Excel.
      </p>

      {/* Template downloads */}
      <div className="bg-white rounded-lg border border-[#DDE3EC] p-4 mb-6">
        <p className="text-sm font-medium text-[#0F1F3D] mb-2">Descargar plantillas</p>
        <div className="flex gap-2">
          {ENTIDADES.map((e) => (
            <a
              key={e.value}
              href={`/api/v1/importacion/plantilla/${e.value}`}
              download
              className="text-xs text-[#E85D04] hover:underline"
            >
              📄 {e.label}
            </a>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-[#DDE3EC] p-6 space-y-4">
        <div>
          <label htmlFor="entidad" className="block text-sm font-medium text-[#0F1F3D] mb-1">
            Entidad
          </label>
          <select
            id="entidad"
            value={entidad}
            onChange={(e) => setEntidad(e.target.value)}
            className="w-full h-9 rounded-md border border-[#DDE3EC] px-3 text-sm"
          >
            {ENTIDADES.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="file" className="block text-sm font-medium text-[#0F1F3D] mb-1">
            Archivo (CSV o XLSX)
          </label>
          <input
            id="file"
            type="file"
            accept=".csv,.xlsx"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm text-[#4A5568]"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="dryRun"
            checked={dryRun}
            onChange={(e) => setDryRun(e.target.checked)}
          />
          <label htmlFor="dryRun" className="text-sm text-[#4A5568]">
            Modo prueba (dry-run) — solo validar, no importar
          </label>
        </div>

        <Button
          type="submit"
          disabled={loading || !file}
          className="bg-[#E85D04] hover:bg-[#F48C06] text-white"
        >
          {loading ? "Procesando..." : dryRun ? "Validar Archivo" : "Importar Datos"}
        </Button>
      </form>

      {result && (
        <div className="mt-4 bg-white rounded-lg border border-[#DDE3EC] p-4">
          <p className="text-sm font-medium text-[#0F1F3D]">Importación en proceso</p>
          <p className="text-xs text-[#4A5568] mt-1">
            ID: <span className="font-mono">{result.id}</span>
          </p>
          <p className="text-xs text-[#4A5568]">Estado: {result.estado}</p>
          {result.dryRun && (
            <p className="text-xs text-amber-600 mt-1">Modo prueba — no se importaron datos</p>
          )}
        </div>
      )}
    </div>
  );
}
