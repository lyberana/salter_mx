import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0F1F3D] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-[#E85D04] rounded-xl flex items-center justify-center font-extrabold text-white text-xl">
          GF
        </div>
        <div>
          <div className="text-white font-bold text-3xl tracking-tight">SALTER</div>
          <div className="text-[#FAA307] text-sm tracking-widest font-medium">
            ALTERNATIVA EN MOVIMIENTO
          </div>
        </div>
      </div>

      {/* Tagline */}
      <p className="text-[#8A96A8] text-center max-w-md mb-10 text-sm leading-relaxed">
        Plataforma logística para operaciones de cadena de suministro.
        Gestiona envíos, órdenes, flota y más desde un solo lugar.
      </p>

      {/* CTA */}
      <Link
        href="/login"
        className="inline-flex items-center justify-center h-11 px-8 rounded-lg bg-[#E85D04] text-white font-semibold text-sm hover:bg-[#F48C06] transition-colors"
      >
        Iniciar Sesión
      </Link>

      {/* Footer */}
      <div className="absolute bottom-6 text-center space-y-1">
        <p className="text-[#8A96A8] text-xs">📞 (777) 609 6289 · (777) 609 6290</p>
        <p className="text-[#8A96A8] text-xs">📧 administracion@gfsalter.com</p>
        <p className="text-[#4A5568] text-xs">© {new Date().getFullYear()} GF SALTER · Cuernavaca, Morelos</p>
      </div>
    </div>
  );
}
