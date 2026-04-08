"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const REMEMBER_KEY = "salter_remember_email";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Load saved email on mount
  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Save or clear email based on checkbox
    if (rememberMe) {
      localStorage.setItem(REMEMBER_KEY, email);
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Credenciales incorrectas. Verifica tu correo y contraseña.");
    } else {
      // Check if user needs to change password — fetch session to check flag
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      if (session?.user?.mustChangePassword) {
        router.push("/cambiar-contrasena");
      } else {
        router.push("/dashboard");
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB] px-4">
      <div className="w-full max-w-sm bg-white rounded-xl border border-[#DDE3EC] p-8 shadow-sm">
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-[#8A96A8] hover:text-[#0F1F3D] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#E85D04] rounded-lg flex items-center justify-center font-bold text-white text-sm">GF</div>
            <div>
              <div className="font-bold text-[#0F1F3D] text-lg leading-tight">SALTER</div>
              <div className="text-[#FAA307] text-xs tracking-wider">ALTERNATIVA EN MOVIMIENTO</div>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[#0F1F3D] block mb-1">Correo electrónico</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@empresa.com" required />
          </div>
          <div>
            <label className="text-sm font-medium text-[#0F1F3D] block mb-1">Contraseña</label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              className="rounded border-[#DDE3EC]"
            />
            <label htmlFor="rememberMe" className="text-sm text-[#4A5568]">Recordarme</label>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-[#E85D04] hover:bg-[#F48C06] text-white">
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
        </form>
        <div className="mt-6 pt-4 border-t border-[#EEF1F6] text-center space-y-1">
          <p className="text-xs text-[#8A96A8]">📞 (777) 609 6289 · (777) 609 6290</p>
          <p className="text-xs text-[#8A96A8]">📧 administracion@gfsalter.com</p>
          <p className="text-xs text-[#8A96A8]">📍 Cuernavaca, Mor.</p>
        </div>
      </div>
    </div>
  );
}
