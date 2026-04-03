export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-[#0F1F3D] mb-2">Dashboard</h1>
      <p className="text-sm text-[#4A5568] mb-8">
        Bienvenido a la plataforma logística GF SALTER.
      </p>

      {/* KPI placeholder cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-[#DDE3EC] p-5">
          <p className="text-xs text-[#8A96A8] mb-1">Total Envíos</p>
          <p className="text-2xl font-bold text-[#0F1F3D]">—</p>
        </div>
        <div className="bg-white rounded-lg border border-[#DDE3EC] p-5">
          <p className="text-xs text-[#8A96A8] mb-1">En Tránsito</p>
          <p className="text-2xl font-bold text-[#E85D04]">—</p>
        </div>
        <div className="bg-white rounded-lg border border-[#DDE3EC] p-5">
          <p className="text-xs text-[#8A96A8] mb-1">Entregados Hoy</p>
          <p className="text-2xl font-bold text-green-600">—</p>
        </div>
        <div className="bg-white rounded-lg border border-[#DDE3EC] p-5">
          <p className="text-xs text-[#8A96A8] mb-1">Vehículos Activos</p>
          <p className="text-2xl font-bold text-blue-600">—</p>
        </div>
      </div>

      {/* Placeholder sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-[#DDE3EC] p-6">
          <h2 className="text-sm font-semibold text-[#0F1F3D] mb-3">Órdenes Recientes</h2>
          <p className="text-sm text-[#8A96A8]">Las métricas en tiempo real estarán disponibles en Release 2.</p>
        </div>
        <div className="bg-white rounded-lg border border-[#DDE3EC] p-6">
          <h2 className="text-sm font-semibold text-[#0F1F3D] mb-3">Mapa de Flota</h2>
          <p className="text-sm text-[#8A96A8]">El mapa de rastreo en tiempo real estará disponible en Release 2.</p>
        </div>
      </div>
    </div>
  );
}
