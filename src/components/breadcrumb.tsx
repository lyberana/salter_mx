"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  envios: "Envíos",
  ordenes: "Órdenes",
  remitentes: "Remitentes",
  consignatarios: "Consignatarios",
  flota: "Flota",
  importacion: "Importación",
  "audit-log": "Audit Log",
  usuarios: "Usuarios",
  nuevo: "Nuevo",
  nueva: "Nueva",
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return <span className="text-sm text-[#8A96A8]">Inicio</span>;

  return (
    <nav className="flex items-center gap-1.5 text-sm">
      <Link href="/envios" className="text-[#8A96A8] hover:text-[#0F1F3D] transition-colors">
        Inicio
      </Link>
      {segments.map((segment, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/");
        const isLast = i === segments.length - 1;
        const label = LABELS[segment] || segment;

        return (
          <span key={href} className="flex items-center gap-1.5">
            <span className="text-[#DDE3EC]">/</span>
            {isLast ? (
              <span className="text-[#0F1F3D] font-medium">{label}</span>
            ) : (
              <Link href={href} className="text-[#8A96A8] hover:text-[#0F1F3D] transition-colors">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
