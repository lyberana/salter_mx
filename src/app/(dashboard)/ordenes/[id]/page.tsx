import Link from "next/link";

type EstadoOrden =
  | "borrador"
  | "confirmada"
  | "en_ruta"
  | "completada"
  | "cancelada";

interface Orden {
  id: string;
  numeroOrden: string;
  estado: EstadoOrden;
  pesoTotalKg: string;
  fechaEntregaComprometida: string | null;
  vehiculoId: string | null;
  operadorId: string | null;
  distanciaKm: string | null;
  tiempoEstimadoMin: number | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const estadoBadgeClasses: Record<EstadoOrden, string> = {
  borrador: "bg-gray-100 text-gray-600",
  confirmada: "bg-blue-50 text-blue-700",
  en_ruta: "bg-amber-50 text-amber-700",
  completada: "bg-green-50 text-green-700",
  cancelada: "bg-slate-50 text-slate-500",
};

const estadoLabels: Record<EstadoOrden, string> = {
  borrador: "Borrador",
  confirmada: "Confirmada",
  en_ruta: "En ruta",
  completada: "Completada",
  cancelada: "Cancelada",
};

// Placeholder — will be replaced with real DB query
async function getOrden(_id: string): Promise<Orden | null> {
  return null;
}

export default async function OrdenDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orden = await getOrden(id);

  if (!orden) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-[#4A5568] mb-2">Orden no encontrada</p>
        <Link href="/ordenes" className="text-sm text-[#E85D04] hover:underline">
          ← Volver a órdenes
        </Link>
      </div>
    );
  }

  const fields: { label: string; value: string }[] = [
    { label: "Número de Orden", value: orden.numeroOrden },
    { label: "Peso Total (kg)", value: orden.pesoTotalKg },
    { label: "Vehículo ID", value: orden.vehiculoId || "—" },
    { label: "Operador ID", value: orden.operadorId || "—" },
    {
      label: "Fecha de entrega comprometida",
      value: orden.fechaEntregaComprometida
        ? new Date(orden.fechaEntregaComprometida).toLocaleDateString("es-MX")
        : "—",
    },
    {
      label: "Distancia (km)",
      value: orden.distanciaKm || "—",
    },
    {
      label: "Tiempo estimado (min)",
      value: orden.tiempoEstimadoMin != null ? String(orden.tiempoEstimadoMin) : "—",
    },
    { label: "Creado por", value: orden.createdBy },
    {
      label: "Creado",
      value: new Date(orden.createdAt).toLocaleString("es-MX"),
    },
    {
      label: "Actualizado",
      value: new Date(orden.updatedAt).toLocaleString("es-MX"),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-[#0F1F3D] font-mono">
            {orden.numeroOrden}
          </h1>
          <span
            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoBadgeClasses[orden.estado]}`}
          >
            {estadoLabels[orden.estado]}
          </span>
        </div>
        <Link
          href="/ordenes"
          className="text-sm text-[#4A5568] hover:text-[#0F1F3D]"
        >
          ← Volver a órdenes
        </Link>
      </div>

      {/* Detail grid */}
      <div className="bg-white rounded-lg border border-[#DDE3EC] p-6 mb-6">
        <h2 className="text-sm font-semibold text-[#0F1F3D] mb-4">
          Datos de la orden
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

      {/* Envíos asociados placeholder */}
      <div className="bg-white rounded-lg border border-[#DDE3EC] p-6 mb-6">
        <h2 className="text-sm font-semibold text-[#0F1F3D] mb-4">
          Envíos asociados
        </h2>
        <p className="text-sm text-[#8A96A8]">
          La lista de envíos incluidos en esta orden se mostrará aquí.
        </p>
      </div>

      {/* Cambio de estado placeholder */}
      <div className="bg-white rounded-lg border border-[#DDE3EC] p-6">
        <h2 className="text-sm font-semibold text-[#0F1F3D] mb-4">
          Cambiar estado
        </h2>
        <p className="text-sm text-[#8A96A8]">
          Las acciones para cambiar el estado de la orden se mostrarán aquí.
        </p>
      </div>
    </div>
  );
}
