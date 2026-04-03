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
  pesoKg: string;
  estado: EstadoEnvio;
  createdAt: string;
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
async function getEnvios(
  _page: number
): Promise<{ envios: Envio[]; total: number }> {
  return { envios: [], total: 0 };
}

export default async function EnviosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { envios, total } = await getEnvios(page);
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[#0F1F3D]">Envíos</h1>
        <Link
          href="/envios/nuevo"
          className="inline-flex items-center justify-center h-9 px-4 rounded-md bg-[#E85D04] text-white text-sm font-medium hover:bg-[#F48C06] transition-colors"
        >
          Nuevo Envío
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-[#DDE3EC] overflow-hidden">
        {envios.length === 0 ? (
          <div className="py-16 text-center text-[#4A5568]">
            <p className="text-lg mb-1">No hay envíos registrados</p>
            <p className="text-sm text-[#8A96A8]">
              Crea tu primer envío para comenzar.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#DDE3EC] bg-[#F8F9FB]">
                <th className="text-left px-4 py-3 font-medium text-[#4A5568]">
                  Folio
                </th>
                <th className="text-left px-4 py-3 font-medium text-[#4A5568]">
                  Peso (kg)
                </th>
                <th className="text-left px-4 py-3 font-medium text-[#4A5568]">
                  Estado
                </th>
                <th className="text-left px-4 py-3 font-medium text-[#4A5568]">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody>
              {envios.map((envio) => (
                <tr
                  key={envio.id}
                  className="border-b border-[#DDE3EC] last:border-b-0 hover:bg-[#F8F9FB]"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/envios/${envio.id}`}
                      className="font-mono text-[#0F1F3D] hover:text-[#E85D04]"
                    >
                      {envio.folio}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[#4A5568]">
                    {envio.pesoKg}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${estadoBadgeClasses[envio.estado]}`}
                    >
                      {estadoLabels[envio.estado]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#4A5568]">
                    {new Date(envio.createdAt).toLocaleDateString("es-MX")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Link
            href={`/envios?page=${Math.max(1, page - 1)}`}
            className={`px-3 py-1.5 rounded text-sm border border-[#DDE3EC] ${
              page <= 1
                ? "text-[#8A96A8] pointer-events-none"
                : "text-[#0F1F3D] hover:bg-white"
            }`}
          >
            Anterior
          </Link>
          <span className="text-sm text-[#4A5568]">
            Página {page} de {totalPages}
          </span>
          <Link
            href={`/envios?page=${Math.min(totalPages, page + 1)}`}
            className={`px-3 py-1.5 rounded text-sm border border-[#DDE3EC] ${
              page >= totalPages
                ? "text-[#8A96A8] pointer-events-none"
                : "text-[#0F1F3D] hover:bg-white"
            }`}
          >
            Siguiente
          </Link>
        </div>
      )}
    </div>
  );
}
