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
  createdAt: string;
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
async function getOrdenes(): Promise<Orden[]> {
  return [];
}

export default async function OrdenesPage() {
  const ordenes = await getOrdenes();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[#0F1F3D]">Órdenes</h1>
        <Link
          href="/ordenes/nueva"
          className="inline-flex items-center justify-center h-9 px-4 rounded-md bg-[#E85D04] text-white text-sm font-medium hover:bg-[#F48C06] transition-colors"
        >
          Nueva Orden
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-[#DDE3EC] overflow-hidden">
        {ordenes.length === 0 ? (
          <div className="py-16 text-center text-[#4A5568]">
            <p className="text-lg mb-1">No hay órdenes registradas</p>
            <p className="text-sm text-[#8A96A8]">
              Crea tu primera orden para comenzar.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#DDE3EC] bg-[#F8F9FB]">
                <th className="text-left px-4 py-3 font-medium text-[#4A5568]">
                  Número de Orden
                </th>
                <th className="text-left px-4 py-3 font-medium text-[#4A5568]">
                  Estado
                </th>
                <th className="text-left px-4 py-3 font-medium text-[#4A5568]">
                  Peso Total (kg)
                </th>
                <th className="text-left px-4 py-3 font-medium text-[#4A5568]">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((orden) => (
                <tr
                  key={orden.id}
                  className="border-b border-[#DDE3EC] last:border-b-0 hover:bg-[#F8F9FB]"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/ordenes/${orden.id}`}
                      className="font-mono text-[#0F1F3D] hover:text-[#E85D04]"
                    >
                      {orden.numeroOrden}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${estadoBadgeClasses[orden.estado]}`}
                    >
                      {estadoLabels[orden.estado]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#4A5568]">
                    {orden.pesoTotalKg}
                  </td>
                  <td className="px-4 py-3 text-[#4A5568]">
                    {new Date(orden.createdAt).toLocaleDateString("es-MX")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
