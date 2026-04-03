import { cn } from "@/lib/utils";

const levelStyles: Record<string, string> = {
  info: "bg-blue-50 text-blue-700",
  warn: "bg-amber-50 text-amber-700",
  error: "bg-orange-50 text-orange-700",
  critical: "bg-red-50 text-red-700",
};

type AuditEntry = {
  id: string;
  correlationId: string;
  nivel: "info" | "warn" | "error" | "critical";
  evento: string;
  userId: string | null;
  entidad: string | null;
  entidadId: string | null;
  payload: unknown;
  errorMessage: string | null;
  stackTrace: string | null;
  createdAt: string;
};

async function fetchAuditLog(params: Record<string, string>): Promise<{ data: AuditEntry[]; meta: { page: number; limit: number; total: number } }> {
  // Placeholder: in production, call the internal API or query DB directly
  return { data: [], meta: { page: 1, limit: 20, total: 0 } };
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const nivel = typeof params.nivel === "string" ? params.nivel : "";
  const evento = typeof params.evento === "string" ? params.evento : "";
  const userId = typeof params.userId === "string" ? params.userId : "";
  const from = typeof params.from === "string" ? params.from : "";
  const to = typeof params.to === "string" ? params.to : "";
  const page = typeof params.page === "string" ? params.page : "1";

  const queryParams: Record<string, string> = {};
  if (nivel) queryParams.nivel = nivel;
  if (evento) queryParams.evento = evento;
  if (userId) queryParams.userId = userId;
  if (from) queryParams.from = from;
  if (to) queryParams.to = to;
  if (page) queryParams.page = page;

  const { data: entries, meta } = await fetchAuditLog(queryParams);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Audit Log</h1>

      {/* Filters */}
      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Nivel
          <select
            name="nivel"
            defaultValue={nivel}
            className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm"
          >
            <option value="">Todos</option>
            <option value="info">Info</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
            <option value="critical">Critical</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Evento
          <input
            name="evento"
            defaultValue={evento}
            placeholder="ej. envio.creado"
            className="h-9 rounded-md border border-gray-300 px-3 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Usuario ID
          <input
            name="userId"
            defaultValue={userId}
            placeholder="UUID"
            className="h-9 rounded-md border border-gray-300 px-3 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Desde
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="h-9 rounded-md border border-gray-300 px-3 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Hasta
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="h-9 rounded-md border border-gray-300 px-3 text-sm"
          />
        </label>

        <button
          type="submit"
          className="h-9 rounded-md bg-[#0F1F3D] px-4 text-sm font-medium text-white hover:bg-[#1A3260] transition-colors"
        >
          Filtrar
        </button>
      </form>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Nivel</th>
              <th className="px-4 py-3">Evento</th>
              <th className="px-4 py-3">Entidad</th>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Mensaje</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {entries.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No se encontraron registros.
                </td>
              </tr>
            )}
            {entries.map((entry) => (
              <tr key={entry.id} className="group">
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                  {new Date(entry.createdAt).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "medium" })}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                      levelStyles[entry.nivel] ?? "bg-gray-100 text-gray-700"
                    )}
                  >
                    {entry.nivel}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-700">{entry.evento}</td>
                <td className="px-4 py-3 text-gray-600">
                  {entry.entidad ? `${entry.entidad}${entry.entidadId ? ` #${entry.entidadId.slice(0, 8)}` : ""}` : "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">{entry.userId?.slice(0, 8) ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">{entry.errorMessage ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta.total > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Mostrando {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} de {meta.total}
          </span>
          <div className="flex gap-2">
            {meta.page > 1 && (
              <a
                href={`?${new URLSearchParams({ ...queryParams, page: String(meta.page - 1) })}`}
                className="rounded-md border px-3 py-1 hover:bg-gray-50"
              >
                Anterior
              </a>
            )}
            {meta.page * meta.limit < meta.total && (
              <a
                href={`?${new URLSearchParams({ ...queryParams, page: String(meta.page + 1) })}`}
                className="rounded-md border px-3 py-1 hover:bg-gray-50"
              >
                Siguiente
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
