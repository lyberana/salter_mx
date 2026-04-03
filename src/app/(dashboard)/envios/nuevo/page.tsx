"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/searchable-select";

const EMBALAJE_OPTIONS = ["Caja", "Sobre", "Paquete", "Bolsa", "Tarima", "Otro"];

export default function NuevoEnvioPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [remitenteId, setRemitenteId] = useState("");
  const [consignatarioId, setConsignatarioId] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const body = {
      folio: fd.get("folio") as string,
      pesoKg: Number(fd.get("pesoKg")),
      largoCm: fd.get("largoCm") ? Number(fd.get("largoCm")) : undefined,
      anchoCm: fd.get("anchoCm") ? Number(fd.get("anchoCm")) : undefined,
      altoCm: fd.get("altoCm") ? Number(fd.get("altoCm")) : undefined,
      tipoContenido: fd.get("tipoContenido") as string,
      valorDeclarado: Number(fd.get("valorDeclarado") || 0),
      piezas: Number(fd.get("piezas") || 1),
      embalaje: (fd.get("embalaje") as string) || undefined,
      ruta: (fd.get("ruta") as string) || undefined,
      numeroCuenta: (fd.get("numeroCuenta") as string) || undefined,
      guiaExterna: (fd.get("guiaExterna") as string) || undefined,
      codigoRastreo: (fd.get("codigoRastreo") as string) || undefined,
      facturado: fd.get("facturado") === "on",
      remitenteId: remitenteId,
      consignatarioId: consignatarioId,
      comentarios: (fd.get("comentarios") as string) || undefined,
    };

    try {
      const res = await fetch("/api/v1/envios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.errors?.[0]?.message ?? "Error al crear el envío");
        return;
      }
      router.push("/envios");
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold text-[#0F1F3D] mb-6">Nuevo Envío</h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-[#DDE3EC] p-6 space-y-5">

        {/* Section: Datos principales */}
        <div>
          <h2 className="text-sm font-semibold text-[#0F1F3D] mb-3 pb-2 border-b border-[#EEF1F6]">Datos del Envío</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0F1F3D] mb-1">Folio *</label>
              <Input name="folio" required placeholder="371687" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F1F3D] mb-1">Piezas *</label>
              <Input name="piezas" type="number" min="1" defaultValue="1" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F1F3D] mb-1">Ruta</label>
              <Input name="ruta" placeholder="GUERRERO, CDMX, etc." />
            </div>
          </div>
        </div>

        {/* Section: Peso y dimensiones */}
        <div>
          <h2 className="text-sm font-semibold text-[#0F1F3D] mb-3 pb-2 border-b border-[#EEF1F6]">Peso y Dimensiones</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0F1F3D] mb-1">Peso (kg) *</label>
              <Input name="pesoKg" type="number" step="0.001" min="0.001" required placeholder="10.000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F1F3D] mb-1">Largo (cm)</label>
              <Input name="largoCm" type="number" step="0.01" placeholder="33" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F1F3D] mb-1">Ancho (cm)</label>
              <Input name="anchoCm" type="number" step="0.01" placeholder="23" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F1F3D] mb-1">Alto (cm)</label>
              <Input name="altoCm" type="number" step="0.01" placeholder="23" />
            </div>
          </div>
        </div>

        {/* Section: Contenido y embalaje */}
        <div>
          <h2 className="text-sm font-semibold text-[#0F1F3D] mb-3 pb-2 border-b border-[#EEF1F6]">Contenido y Embalaje</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0F1F3D] mb-1">Tipo de Contenido *</label>
              <Input name="tipoContenido" required placeholder="Documentos, Electrónicos, Frágil..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F1F3D] mb-1">Embalaje</label>
              <select name="embalaje" className="w-full h-9 rounded-md border border-[#DDE3EC] px-3 text-sm">
                <option value="">— Seleccionar —</option>
                {EMBALAJE_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F1F3D] mb-1">Valor Declarado (MXN)</label>
              <Input name="valorDeclarado" type="number" step="0.01" min="0" defaultValue="0" placeholder="0.00" />
            </div>
          </div>
        </div>

        {/* Section: Remitente y Consignatario */}
        <div>
          <h2 className="text-sm font-semibold text-[#0F1F3D] mb-3 pb-2 border-b border-[#EEF1F6]">Remitente y Consignatario</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0F1F3D] mb-1">Remitente *</label>
              <SearchableSelect
                apiUrl="/api/v1/remitentes"
                placeholder="Buscar por nombre, RFC o CP..."
                value={remitenteId}
                onChange={(id) => setRemitenteId(id)}
              />
              {!remitenteId && <p className="text-xs text-[#8A96A8] mt-1">Escribe para buscar remitentes existentes</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F1F3D] mb-1">Consignatario *</label>
              <SearchableSelect
                apiUrl="/api/v1/consignatarios"
                placeholder="Buscar por nombre, RFC o CP..."
                value={consignatarioId}
                onChange={(id) => setConsignatarioId(id)}
              />
              {!consignatarioId && <p className="text-xs text-[#8A96A8] mt-1">Escribe para buscar consignatarios existentes</p>}
            </div>
          </div>
        </div>

        {/* Section: Información adicional */}
        <div>
          <h2 className="text-sm font-semibold text-[#0F1F3D] mb-3 pb-2 border-b border-[#EEF1F6]">Información Adicional</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[#0F1F3D] mb-1">No. de Cuenta</label>
              <Input name="numeroCuenta" placeholder="Número de cuenta del cliente" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F1F3D] mb-1">Número de Guía Externa</label>
              <Input name="guiaExterna" placeholder="252241" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F1F3D] mb-1">Código de Rastreo</label>
              <Input name="codigoRastreo" placeholder="GUEGUE252241" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0F1F3D] mb-1">Comentarios</label>
            <Textarea name="comentarios" rows={3} placeholder="Notas adicionales (opcional)" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input type="checkbox" id="facturado" name="facturado" className="rounded border-[#DDE3EC]" />
            <label htmlFor="facturado" className="text-sm text-[#4A5568]">Facturado</label>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={submitting} className="bg-[#E85D04] hover:bg-[#F48C06] text-white">
            {submitting ? "Creando…" : "Crear Envío"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/envios")}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
