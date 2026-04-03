import Link from "next/link";

type EstadoEnvio =
  | "pendiente"
  | "recolectado"
  | "en_transito"
  | "en_reparto"
  | "entregado"
  | "no_entregado"
  | "cancelado";

interface Envio {
  id: string;
  folio: string;
  estado: EstadoEnvio;
  pesoKg: string;
  largoCm: string | null;
  anchoCm: string | null;
  altoCm: string | null;
  tipoContenido: string;
  valorDeclarado: string;
  comentarios: string | null;
  remitenteId: string;
  consignatarioId: string;
  createdAt: Date;
  updatedAt: Date;
}

const estadoBadgeClasses: Record<EstadoEnvio, string> = {
  pendiente: "bg-gray-100 text-gray-600",
  recolectado: "bg-blue-50 text-blue-700",
  en_transito: "bg-amber-50 text-amber-700",
  en_reparto: "bg-orange-50 text-orange-700",
  entregado: "bg-green-50 text-green-700",
  no_entregado: "bg-red-50 text-red-700",
  cancelado: "bg-slate-50 text-slate-500",
};

const estadoLabels: Record<EstadoEnvio, string> = {
  pendiente: "Pendiente",
  recolectado: "Recolectado",
  en_transito: "En tránsito",
  en_reparto: "En reparto",
  entregado: "Entregado",
  no_entregado: "No entregado",
  cancelado: "Cancelado",
};

// Placeholder — will be replaced with real DB query
async function getEnvio(_id: string): Promise<Envio | null> {
  return null;
}

export default async function EnvioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const envio = await getEnvio(id);

  if (!envio) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-[#4A5568] mb-2">Envío no encontrado</p>
        <Link href="/envios" className="text-sm text-[#E85D04] hover:underline">
          ← Volver a envíos
        </Link>
      </div>
    );
  }

  const fields: { label: string; value: string }[] = [
    { label: "Folio", value: envio.folio },
    { label: "Peso (kg)", value: envio.pesoKg },
    { label: "Tipo de contenido", value: envio.tipoContenido },
    {
      label: "Valor declarado",
      value: `$${Number(envio.valorDeclarado).toLocaleString("es-MX")} MXN`,
    },
    {
      label: "Dimensiones (cm)",
      value:
        envio.largoCm && envio.anchoCm && envio.altoCm
          ? `${envio.largoCm} × ${envio.anchoCm} × ${envio.altoCm}`
          : "—",
    },
    { label: "Comentarios", value: envio.comentarios || "—" },
    { label: "Remitente ID", value: envio.remitenteId },
    { label: "Consignatario ID", value: envio.consignatarioId },
    {
      label: "Creado",
      value: new Date(envio.createdAt).toLocaleString("es-MX"),
    },
    {
      label: "Actualizado",
      value: new Date(envio.updatedAt).toLocaleString("es-MX"),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-[#0F1F3D] font-mono">
            {envio.folio}
          </h1>
          <span
            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoBadgeClasses[envio.estado]}`}
          >
            {estadoLabels[envio.estado]}
          </span>
        </div>
        <Link
          href="/envios"
          className="text-sm text-[#4A5568] hover:text-[#0F1F3D]"
        >
          ← Volver a envíos
        </Link>
      </div>

      {/* Detail grid */}
      <div className="bg-white rounded-lg border border-[#DDE3EC] p-6 mb-6">
        <h2 className="text-sm font-semibold text-[#0F1F3D] mb-4">
          Datos del envío
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          {fields.map((f) => (
            <div key={f.label}>
              <dt className="text-xs text-[#8A96A8]">{f.label}</dt>
              <dd className="text-sm text-[#0F1F3D] mt-0.5">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Estado history placeholder */}
      <div className="bg-white rounded-lg border border-[#DDE3EC] p-6">
        <h2 className="text-sm font-semibold text-[#0F1F3D] mb-4">
          Historial de estados
        </h2>
        <p className="text-sm text-[#8A96A8]">
          El historial de transiciones de estado se mostrará aquí.
        </p>
      </div>
    </div>
  );
}
