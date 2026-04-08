"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  key: string;
  adminOnly?: boolean;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠", key: "dashboard" },
  { href: "/guias", label: "Guías", icon: "📋", key: "guias" },
  { href: "/remitentes", label: "Remitentes", icon: "👤", key: "remitentes" },
  { href: "/consignatarios", label: "Consignatarios", icon: "📍", key: "consignatarios" },
  { href: "/flota", label: "Flota", icon: "🚛", key: "flota" },
  { href: "/importacion", label: "Importación", icon: "📥", key: "importacion", adminOnly: true },
  { href: "/usuarios", label: "Usuarios", icon: "👥", key: "usuarios", adminOnly: true },
  { href: "/audit-log", label: "Audit Log", icon: "📜", key: "audit-log", adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role ?? "";
  const [collapsed, setCollapsed] = useState(false);

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || userRole === "administrador"
  );

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-60"
      } shrink-0 bg-[#0F1F3D] flex flex-col transition-all duration-200`}
    >
      {/* Logo — click to toggle collapse */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 px-3 py-4 border-b border-white/10 w-full hover:bg-[#1A3260] transition-colors cursor-pointer"
        title={collapsed ? "Expandir menú" : "Colapsar menú"}
      >
        <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-[#E85D04] text-white text-sm font-bold flex-shrink-0">
          GF
        </span>
        {!collapsed && (
          <span className="text-white font-semibold text-lg tracking-tight">
            SALTER
          </span>
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.key}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "text-white bg-[#1A3260]"
                  : "text-[#8A96A8] hover:text-white hover:bg-[#1A3260]"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
