"use client";

import Link from "next/link";
import { Package, Truck, MapPin, Clock, Phone, Mail, ChevronRight } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: Package,
    title: "Mensajería y Paquetería Exprés",
    description:
      "Envíos rápidos y seguros con rastreo en tiempo real. Cobertura local y foránea desde Cuernavaca, Morelos.",
  },
  {
    icon: Truck,
    title: "Distribución Última Milla",
    description:
      "Entrega directa al consumidor final con optimización de rutas y confirmación de entrega digital.",
  },
  {
    icon: Clock,
    title: "Entrega y Recolección Programadas",
    description:
      "Agenda recolecciones y entregas en horarios específicos. Ideal para e-commerce y empresas con volumen.",
  },
  {
    icon: MapPin,
    title: "Cobertura Local y Foránea",
    description:
      "Red de distribución que conecta Cuernavaca con destinos nacionales. Tarifas competitivas por volumen.",
  },
];

const stats = [
  { value: "10K+", label: "Envíos mensuales" },
  { value: "99.2%", label: "Tasa de entrega" },
  { value: "24h", label: "Tiempo promedio" },
  { value: "150+", label: "Rutas activas" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0F1F3D] text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-4 sm:px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#E85D04] rounded-lg flex items-center justify-center font-extrabold text-white text-sm">
            GF
          </div>
          <div>
            <div className="text-white font-bold text-xl tracking-tight">SALTER</div>
            <div className="text-[#FAA307] text-[10px] tracking-widest font-medium">
              ALTERNATIVA EN MOVIMIENTO
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/rastreo"
            className="hidden sm:inline text-[#8A96A8] hover:text-white text-sm transition-colors"
          >
            Rastrear Envío
          </Link>
          <Link
            href="/rastreo"
            className="sm:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg border border-[#2A3F5F] text-[#8A96A8] hover:text-white hover:border-[#E85D04] transition-colors"
            aria-label="Rastrear Envío"
          >
            <MapPin className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center h-9 px-4 sm:px-5 rounded-lg bg-[#E85D04] text-white font-semibold text-sm hover:bg-[#F48C06] transition-colors"
          >
            <span className="hidden sm:inline">Iniciar Sesión</span>
            <span className="sm:hidden">Entrar</span>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-14 sm:pb-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="text-center lg:text-left">
            <Badge className="bg-[#E85D04]/20 text-[#FAA307] border-[#E85D04]/30 mb-4 sm:mb-6">
              Plataforma Logística
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4 sm:mb-6">
              Tu carga, nuestra{" "}
              <span className="text-[#E85D04]">prioridad</span>
            </h1>
            <p className="text-[#8A96A8] text-base sm:text-lg leading-relaxed mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0">
              Gestiona envíos, órdenes de transporte y flota desde una sola
              plataforma. Rastreo en tiempo real y cumplimiento fiscal
              automatizado.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 sm:gap-4">
              <Link href="/login">
                <Button className="h-12 px-8 bg-[#E85D04] hover:bg-[#F48C06] text-white font-semibold">
                  Comenzar Ahora
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/rastreo">
                <Button
                  variant="outline"
                  className="h-12 px-8 border-[#2A3F5F] text-[#8A96A8] hover:text-white hover:border-[#E85D04] bg-transparent"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Rastrear Envío
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <Card
                key={stat.label}
                className="bg-[#1A2D4D] border-[#2A3F5F] text-center"
              >
                <CardContent className="pt-6 pb-4">
                  <div className="text-3xl font-bold text-[#E85D04] mb-1">
                    {stat.value}
                  </div>
                  <div className="text-[#8A96A8] text-sm">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-14 sm:pb-20">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl font-bold mb-3">Nuestros Servicios</h2>
          <p className="text-[#8A96A8] max-w-md mx-auto">
            Soluciones logísticas integrales para tu negocio
          </p>
        </div>

        <Carousel
          opts={{ align: "start", loop: true }}
          plugins={[Autoplay({ delay: 4000, stopOnInteraction: true })]}
          className="w-full max-w-5xl mx-auto px-10 sm:px-12"
        >
          <CarouselContent className="-ml-3 sm:-ml-4">
            {services.map((svc) => (
              <CarouselItem
                key={svc.title}
                className="pl-3 sm:pl-4 basis-[85%] sm:basis-1/2 lg:basis-1/3"
              >
                <Card className="bg-[#1A2D4D] border-[#2A3F5F] h-full hover:border-[#E85D04]/50 transition-colors">
                  <CardContent className="p-6 flex flex-col gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#E85D04]/20 flex items-center justify-center">
                      <svc.icon className="h-6 w-6 text-[#E85D04]" />
                    </div>
                    <h3 className="font-semibold text-white">{svc.title}</h3>
                    <p className="text-[#8A96A8] text-sm leading-relaxed">
                      {svc.description}
                    </p>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0 border-[#2A3F5F] bg-[#1A2D4D] text-white hover:bg-[#E85D04] hover:border-[#E85D04]" />
          <CarouselNext className="right-0 border-[#2A3F5F] bg-[#1A2D4D] text-white hover:bg-[#E85D04] hover:border-[#E85D04]" />
        </Carousel>
      </section>

      {/* CTA - Rastreo */}
      <section className="bg-[#1A2D4D] py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-3">¿Dónde está tu envío?</h2>
          <p className="text-[#8A96A8] mb-8 max-w-md mx-auto">
            Ingresa tu número de folio y consulta el estado de tu paquete en
            tiempo real.
          </p>
          <Link href="/rastreo">
            <Button className="h-12 px-10 bg-[#E85D04] hover:bg-[#F48C06] text-white font-semibold">
              <MapPin className="mr-2 h-4 w-4" />
              Ir a Rastreo
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#E85D04] rounded-md flex items-center justify-center font-extrabold text-white text-xs">
              GF
            </div>
            <span className="text-white font-bold">SALTER</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-[#8A96A8] text-sm text-center">
            <span className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" /> (777) 609 6289
            </span>
            <span className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" /> administracion@gfsalter.com
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> 20 de Noviembre No. 19, Col.
              Reforma, Cuernavaca, Mor. C.P. 62250
            </span>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-[#2A3F5F] text-center">
          <p className="text-[#4A5568] text-xs">
            © {new Date().getFullYear()} GF SALTER — Servicios Alternativos.
            Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
