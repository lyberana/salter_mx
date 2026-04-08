"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { GuiaFormDialog } from "@/components/guia-form-dialog";
import { GuiaPrintPreview } from "@/components/guia-print-preview";
import type { GuiaPrintData } from "@/components/guia-print-layout";

type EstadoGuia = "creada" | "en_ruta" | "completada" | "cancelada";

interface Guia {
  id: string;
  folio: string;
  estado: EstadoGuia;
  pesoKg: string;
  piezas: number;
  createdAt: string;
}

const estadoBadgeClasses: Record<EstadoGuia, string> = {
  creada: "bg-blue-50 text-blue-700",
  en_ruta: "bg-amber-50 text-amber-700",
  completada: "bg-green-50 text-green-700",
  cancelada: "bg-red-50 text-red-600",
};

const estadoLabels: Record<EstadoGuia, string> = {
  creada: "Creada",
  en_ruta: "En ruta",
  completada: "Completada",
  cancelada: "Cancelada",
};

export default function GuiasPage() {
  const { data: session } = useSession();
  const [guias, setGuias] = useState<Guia[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [printGuia, setPrintGuia] = useState<GuiaPrintData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const userRole = (session?.user as any)?.role;
  const canCreateGuia = userRole === "coordinador" || userRole === "administrador";

  useEffect(() => {
    fetchGuias();
  }, []);

  async function fetchGuias() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/guias");
      if (res.ok) {
        const json = await res.json();
        setGuias(json.data ?? []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  function handleDialogClose(open: boolean) {
    setDialogOpen(open);
    if (!open) fetchGuias();
  }

  function handlePrint(guia: GuiaPrintData) {
    setPrintGuia(guia);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[#0F1F3D]">Guías</h1>
        <Input
          placeholder="Buscar por folio..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-64"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-[#DDE3EC] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-[#4A5568]">
            <p className="text-sm text-[#8A96A8]">Cargando guías...</p>
          </div>
        ) : guias.length === 0 ? (
          <div className="py-16 text-center text-[#4A5568]">
            <p className="text-lg mb-1">No hay guías registradas</p>
            <p className="text-sm text-[#8A96A8]">
              Crea tu primera guía para comenzar.
            </p>
          </div>
        ) : (() => {
          const filtered = searchQuery.trim()
            ? guias.filter(g => g.folio.toLowerCase().includes(searchQuery.toLowerCase()))
            : guias;
          return filtered.length === 0 ? (
            <div className="py-12 text-center text-[#4A5568]">
              <p className="text-sm text-[#8A96A8]">No se encontraron guías con ese folio.</p>
            </div>
          ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#DDE3EC] bg-[#F8F9FB]">
                <th className="text-left px-4 py-3 font-medium text-[#4A5568]">Folio</th>
                <th className="text-left px-4 py-3 font-medium text-[#4A5568]">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-[#4A5568]">Peso (kg)</th>
                <th className="text-left px-4 py-3 font-medium text-[#4A5568]">Piezas</th>
                <th className="text-left px-4 py-3 font-medium text-[#4A5568]">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((guia) => (
                <tr
                  key={guia.id}
                  className="border-b border-[#DDE3EC] last:border-b-0 hover:bg-[#F8F9FB]"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/guias/${guia.id}`}
                      className="font-mono text-[#0F1F3D] hover:text-[#E85D04]"
                    >
                      {guia.folio}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${estadoBadgeClasses[guia.estado]}`}
                    >
                      {estadoLabels[guia.estado]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#4A5568]">{guia.pesoKg}</td>
                  <td className="px-4 py-3 text-[#4A5568]">{guia.piezas}</td>
                  <td className="px-4 py-3 text-[#4A5568]">
                    {new Date(guia.createdAt).toLocaleDateString("es-MX")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
        })()}
      </div>

      <GuiaFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onPrint={handlePrint}
      />

      {printGuia && (
        <GuiaPrintPreview
          open={!!printGuia}
          onOpenChange={(open) => { if (!open) setPrintGuia(null); }}
          guia={printGuia}
        />
      )}
    </div>
  );
}
