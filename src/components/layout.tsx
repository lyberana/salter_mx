"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-md transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        } p-4 z-50`}
      >
        <Button
          variant="outline"
          onClick={() => setCollapsed(!collapsed)}
          className="mb-4 w-full"
        >
          {collapsed ? "➡️" : "⬅️ Collapse"}
        </Button>

        {!collapsed && (
          <nav className="space-y-2">
            <Link href="/envios">
              <Button variant="ghost" className="w-full justify-start">
                📤 Registrar Envío
              </Button>
            </Link>
            <Link href="/envios/list">
              <Button variant="ghost" className="w-full justify-start">
                📋 Ver Envíos
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start">
                🏠 Inicio
              </Button>
            </Link>
          </nav>
        )}

        {/* User Info */}
        {!collapsed && (
          <div className="mt-10 border-t pt-4 text-sm text-gray-600">
            <p>
              <strong>Usuario:</strong> Ana
            </p>
            <Button variant="outline" className="mt-2 w-full">
              Cerrar sesión
            </Button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ml-${collapsed ? "16" : "64"} p-10`}>
        {children}
      </main>
    </div>
  );
}
