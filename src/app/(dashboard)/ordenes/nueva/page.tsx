"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NuevaOrdenPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);

    const envioIdsRaw = (fd.get("envioIds") as string).trim();
    const envioIds = envioIdsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (envioIds.length === 0) {
      setError("Se requiere al menos un ID de envío.");
      setSubmitting(false);
      return;
    }

    const vehiculoId = (fd.get("vehiculoId") as string).trim() || undefined;
    const operadorId = (fd.get("operadorId") as string).trim() || undefined;
    const fechaEntregaComprometida =
      (fd.get("fechaEntregaComprometida") as string).trim() || undefined;

    const body = {
      envioIds,
      vehiculoId,
      operadorId,
      fechaEntregaComprometida,
    };

    try {
      const res = await fetch("/api/v1/ordenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const json = await res.json();
        const msg =
          json.errors?.[0]?.message ?? "Error al crear la orden";
        setError(msg);
        return;
      }

      router.push("/ordenes");
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-[#0F1F3D] mb-6">
        Nueva Orden
      </h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg border border-[#DDE3EC] p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-[#0F1F3D] mb-1">
            IDs de Envíos (UUIDs separados por coma)
          </label>
          <Input
            name="envioIds"
            required
            placeholder="uuid-1, uuid-2, uuid-3"
          />
          <p className="text-xs text-[#8A96A8] mt-1">
            Ingresa los UUIDs de los envíos a incluir, separados por coma.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#0F1F3D] mb-1">
              ID Vehículo (opcional)
            </label>
            <Input name="vehiculoId" placeholder="UUID del vehículo" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0F1F3D] mb-1">
              ID Operador (opcional)
            </label>
            <Input name="operadorId" placeholder="UUID del operador" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0F1F3D] mb-1">
            Fecha de entrega comprometida (opcional)
          </label>
          <Input name="fechaEntregaComprometida" type="date" />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="submit"
            disabled={submitting}
            className="bg-[#E85D04] hover:bg-[#F48C06] text-white"
          >
            {submitting ? "Creando…" : "Crear Orden"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/ordenes")}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
