"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Package,
  Search,
  MapPin,
  CheckCircle2,
  Truck,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type TrackingStep = {
  status: string;
  location: string;
  date: string;
  time: string;
  completed: boolean;
  current: boolean;
};

const demoTracking: TrackingStep[] = [
  {
    status: "Paquete recibido en origen",
    location: "Cuernavaca, Morelos",
    date: "05 Abr 2026",
    time: "09:15",
    completed: true,
    current: false,
  },
  {
    status: "En tránsito — Centro de distribución",
    location: "CDMX, México",
    date: "05 Abr 2026",
    time: "14:30",
    completed: true,
    current: false,
  },
  {
    status: "En reparto",
    location: "Querétaro, Querétaro",
    date: "06 Abr 2026",
    time: "08:45",
    completed: true,
    current: true,
  },
  {
    status: "Entregado",
    location: "Querétaro, Querétaro",
    date: "—",
    time: "—",
    completed: false,
    current: false,
  },
];

export default function RastreoPage() {
  const [folio, setFolio] = useState("");
  const [showResult, setShowResult] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (folio.trim()) setShowResult(true);
  };

  return (
    <div className="min-h-screen bg-[#0F1F3D] text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 sm:px-6 py-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#E85D04] rounded-lg flex items-center justify-center font-extrabold text-white text-sm">
            GF
          </div>
          <div>
            <div className="text-white font-bold text-xl tracking-tight">SALTER</div>
            <div className="text-[#FAA307] text-[10px] tracking-widest font-medium">
              ALTERNATIVA EN MOVIMIENTO
            </div>
          </div>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1 text-[#8A96A8] hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Volver al inicio</span>
          <span className="sm:hidden">Inicio</span>
        </Link>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-20">
        {/* Search */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#E85D04]/20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <MapPin className="h-7 w-7 sm:h-8 sm:w-8 text-[#E85D04]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Rastreo de Envío</h1>
          <p className="text-[#8A96A8] text-sm sm:text-base">
            Ingresa tu número de folio para consultar el estado de tu paquete
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 sm:gap-3 mb-8 sm:mb-10">
          <Input
            placeholder="Ej: ENV-202604-00123"
            value={folio}
            onChange={(e) => {
              setFolio(e.target.value);
              if (!e.target.value.trim()) setShowResult(false);
            }}
            className="h-11 sm:h-12 bg-[#1A2D4D] border-[#2A3F5F] text-white placeholder:text-[#4A5568] focus-visible:ring-[#E85D04]"
          />
          <Button
            type="submit"
            className="h-11 sm:h-12 px-4 sm:px-6 bg-[#E85D04] hover:bg-[#F48C06] text-white font-semibold shrink-0"
          >
            <Search className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Buscar</span>
          </Button>
        </form>

        {/* Demo Result */}
        {showResult && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Summary card */}
            <Card className="bg-[#1A2D4D] border-[#2A3F5F]">
              <CardHeader className="pb-3 px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <CardTitle className="text-white text-base sm:text-lg flex items-center gap-2">
                    <Package className="h-5 w-5 text-[#E85D04]" />
                    {folio || "ENV-202604-00123"}
                  </CardTitle>
                  <Badge className="bg-[#E85D04]/20 text-[#FAA307] border-[#E85D04]/30">
                    <Truck className="h-3 w-3 mr-1" />
                    En reparto
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm">
                  <div>
                    <div className="text-[#4A5568] mb-1">Origen</div>
                    <div className="text-[#8A96A8]">Cuernavaca, Mor.</div>
                  </div>
                  <div>
                    <div className="text-[#4A5568] mb-1">Destino</div>
                    <div className="text-[#8A96A8]">Querétaro, Qro.</div>
                  </div>
                  <div>
                    <div className="text-[#4A5568] mb-1">Peso</div>
                    <div className="text-[#8A96A8]">2.5 kg</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="bg-[#1A2D4D] border-[#2A3F5F]">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#E85D04]" />
                  Historial de Movimientos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  {demoTracking.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      {/* Timeline line */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-3 h-3 rounded-full shrink-0 ${
                            step.current
                              ? "bg-[#E85D04] ring-4 ring-[#E85D04]/20"
                              : step.completed
                              ? "bg-[#22C55E]"
                              : "bg-[#2A3F5F]"
                          }`}
                        />
                        {i < demoTracking.length - 1 && (
                          <div
                            className={`w-0.5 h-14 ${
                              step.completed ? "bg-[#22C55E]/30" : "bg-[#2A3F5F]"
                            }`}
                          />
                        )}
                      </div>
                      {/* Content */}
                      <div className="pb-6">
                        <div
                          className={`font-medium text-sm ${
                            step.current
                              ? "text-[#E85D04]"
                              : step.completed
                              ? "text-white"
                              : "text-[#4A5568]"
                          }`}
                        >
                          {step.status}
                          {step.completed && !step.current && (
                            <CheckCircle2 className="inline ml-2 h-3.5 w-3.5 text-[#22C55E]" />
                          )}
                        </div>
                        <div className="text-[#8A96A8] text-xs mt-1">
                          {step.location}
                        </div>
                        <div className="text-[#4A5568] text-xs">
                          {step.date} · {step.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <p className="text-center text-[#4A5568] text-xs">
              Esta es una demostración. Los datos mostrados son ficticios.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
