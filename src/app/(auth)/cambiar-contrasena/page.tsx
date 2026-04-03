"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CambiarContrasenaPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/v1/cambiar-contrasena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.errors?.[0]?.message ?? "Error al cambiar contraseña");
        return;
      }
      // Sign out so the user logs in with the new password (refreshes JWT)
      await signOut({ callbackUrl: "/login" });
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
      <div className="w-full max-w-sm bg-white rounded-xl border border-[#DDE3EC] p-8 shadow-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#E85D04] rounded-lg flex items-center justify-center font-bold text-white text-sm">GF</div>
            <div>
              <div className="font-bold text-[#0F1F3D] text-lg leading-tight">SALTER</div>
              <div className="text-[#FAA307] text-xs tracking-wider">ALTERNATIVA EN MOVIMIENTO</div>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-md px-4 py-3 mb-6">
          <p className="text-sm text-amber-800 font-medium">Cambio de contraseña requerido</p>
          <p className="text-xs text-amber-700 mt-1">Por seguridad, debes establecer una nueva contraseña antes de continuar.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[#0F1F3D] block mb-1">Nueva contraseña</label>
            <Input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#0F1F3D] block mb-1">Confirmar contraseña</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full bg-[#E85D04] hover:bg-[#F48C06] text-white">
            {loading ? "Guardando..." : "Cambiar Contraseña"}
          </Button>
        </form>
      </div>
    </div>
  );
}
