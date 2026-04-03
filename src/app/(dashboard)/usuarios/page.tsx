"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ROLES = [
  { value: "administrador", label: "Administrador", description: "Acceso total al sistema", permisos: ["Gestión de usuarios", "Audit log", "Importación masiva", "Envíos", "Órdenes", "Flota", "Configuración"] },
  { value: "coordinador", label: "Coordinador", description: "Gestión operativa de envíos y flota", permisos: ["Envíos", "Órdenes", "Flota", "Rastreo", "Reportes"] },
  { value: "operador", label: "Operador", description: "Operación en campo y actualización de estados", permisos: ["Ver envíos asignados", "Actualizar estado de envío", "Reportar ubicación GPS"] },
  { value: "cliente", label: "Cliente", description: "Consulta de envíos y rastreo", permisos: ["Ver sus envíos", "Rastreo público", "Historial de entregas"] },
];

const ROLE_BADGE: Record<string, string> = {
  administrador: "bg-purple-50 text-purple-700",
  coordinador: "bg-blue-50 text-blue-700",
  operador: "bg-amber-50 text-amber-700",
  cliente: "bg-green-50 text-green-700",
};

const DOMAIN = "@gfsalter.com";

interface User {
  id: string; email: string; nombre: string; rol: string;
  activo: boolean; updatedBy: string | null; createdAt: string; updatedAt: string;
}

export default function UsuariosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userRole = (session?.user as any)?.role ?? "";

  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdUser, setCreatedUser] = useState<{ nombre: string; email: string; tempPassword: string } | null>(null);
  const [selectedRole, setSelectedRole] = useState("coordinador");
  const [nickname, setNickname] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resetResult, setResetResult] = useState<{ nombre: string; email: string; tempPassword: string } | null>(null);

  useEffect(() => {
    if (status === "authenticated" && userRole !== "administrador") router.push("/dashboard");
  }, [status, userRole, router]);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/v1/usuarios");
      const json = await res.json();
      if (res.ok) setUsers(json.data ?? []);
    } catch { setError("Error al cargar usuarios"); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchUsers(); }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(""); setSubmitting(true); setCreatedUser(null);
    const fd = new FormData(e.currentTarget);
    const body = { nickname: fd.get("nickname") as string, nombre: fd.get("nombre") as string, rol: fd.get("rol") as string };
    try {
      const res = await fetch("/api/v1/usuarios", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok) { setFormError(json.errors?.[0]?.message ?? "Error"); return; }
      setCreatedUser({ nombre: json.data.nombre, email: json.data.email, tempPassword: json.data.tempPassword });
      setShowForm(false); setNickname(""); fetchUsers();
    } catch { setFormError("Error de conexión"); }
    finally { setSubmitting(false); }
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingUser) return;
    setFormError(""); setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const body = { nombre: fd.get("nombre") as string, rol: fd.get("rol") as string, activo: fd.get("activo") === "true" };
    try {
      const res = await fetch(`/api/v1/usuarios/${editingUser.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok) { setFormError(json.errors?.[0]?.message ?? "Error"); return; }
      setEditingUser(null); fetchUsers();
    } catch { setFormError("Error de conexión"); }
    finally { setSubmitting(false); }
  }

  async function handleResetPassword(user: User) {
    if (!confirm(`¿Restablecer contraseña de ${user.nombre}?`)) return;
    setResetResult(null);
    setCreatedUser(null);
    try {
      const res = await fetch(`/api/v1/usuarios/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset-password" }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setResetResult({ nombre: json.data.nombre, email: json.data.email, tempPassword: json.data.tempPassword });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        alert(json.errors?.[0]?.message ?? "Error al restablecer contraseña");
      }
    } catch {
      alert("Error de conexión al restablecer contraseña");
    }
  }

  if (status === "loading") return <div className="py-12 text-center text-[#8A96A8]">Cargando...</div>;
  if (userRole !== "administrador") return <div className="py-12 text-center text-[#8A96A8]">Acceso no autorizado. Redirigiendo...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[#0F1F3D]">Usuarios</h1>
        <Button onClick={() => { setShowForm(!showForm); setEditingUser(null); setCreatedUser(null); setResetResult(null); }} className="bg-[#E85D04] hover:bg-[#F48C06] text-white text-sm">
          {showForm ? "Cancelar" : "+ Nuevo Usuario"}
        </Button>
      </div>

      {/* Temp password alerts */}
      {(createdUser || resetResult) && (() => {
        const data = createdUser || resetResult;
        const label = createdUser ? "Usuario creado" : "Contraseña restablecida";
        return (
          <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
            <p className="text-sm font-medium text-green-800 mb-2">✓ {label}: {data!.nombre} ({data!.email})</p>
            <div className="bg-white rounded-md border border-green-200 p-3">
              <p className="text-xs text-[#4A5568] mb-1">Contraseña temporal:</p>
              <p className="font-mono text-lg font-bold text-[#0F1F3D] select-all">{data!.tempPassword}</p>
            </div>
            <p className="text-xs text-green-700 mt-2">⚠ Solo se muestra una vez. El usuario deberá cambiarla al iniciar sesión.</p>
            <Button variant="outline" size="sm" className="mt-2 text-xs" onClick={() => navigator.clipboard.writeText(data!.tempPassword)}>Copiar</Button>
          </div>
        );
      })()}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-lg border border-[#DDE3EC] p-6 mb-6 space-y-4">
          <p className="text-sm text-[#4A5568]">Se generará una contraseña temporal automáticamente.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0F1F3D] mb-1">Nombre completo</label>
              <Input name="nombre" required placeholder="Juan Pérez" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F1F3D] mb-1">Nickname (usuario)</label>
              <div className="flex">
                <Input name="nickname" required placeholder="juan.perez" value={nickname} onChange={e => setNickname(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))}
                  className="rounded-r-none" />
                <span className="inline-flex items-center px-3 bg-[#EEF1F6] border border-l-0 border-[#DDE3EC] rounded-r-md text-xs text-[#4A5568]">{DOMAIN}</span>
              </div>
              {nickname && <p className="text-xs text-[#8A96A8] mt-1">Correo: <span className="font-mono">{nickname}{DOMAIN}</span></p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F1F3D] mb-1">Rol</label>
              <select name="rol" required value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className="w-full h-9 rounded-md border border-[#DDE3EC] px-3 text-sm">
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label} — {r.description}</option>)}
              </select>
            </div>
          </div>
          {(() => { const role = ROLES.find(r => r.value === selectedRole); if (!role) return null; return (
            <div className="bg-[#F8F9FB] rounded-md border border-[#DDE3EC] px-4 py-3">
              <p className="text-xs font-medium text-[#0F1F3D] mb-1.5">Acceso para {role.label}:</p>
              <div className="flex flex-wrap gap-1.5">{role.permisos.map(p => <span key={p} className="inline-flex px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700">{p}</span>)}</div>
            </div>
          ); })()}
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <Button type="submit" disabled={submitting} className="bg-[#E85D04] hover:bg-[#F48C06] text-white">{submitting ? "Creando..." : "Crear Usuario"}</Button>
        </form>
      )}

      {/* Edit form */}
      {editingUser && (
        <form onSubmit={handleEdit} className="bg-white rounded-lg border border-[#DDE3EC] p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#0F1F3D]">Editando: {editingUser.email}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => setEditingUser(null)}>Cancelar</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0F1F3D] mb-1">Nombre</label>
              <Input name="nombre" required defaultValue={editingUser.nombre} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F1F3D] mb-1">Rol</label>
              <select name="rol" required defaultValue={editingUser.rol} className="w-full h-9 rounded-md border border-[#DDE3EC] px-3 text-sm">
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F1F3D] mb-1">Estado</label>
              <select name="activo" required defaultValue={String(editingUser.activo)} className="w-full h-9 rounded-md border border-[#DDE3EC] px-3 text-sm">
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <Button type="submit" disabled={submitting} className="bg-[#E85D04] hover:bg-[#F48C06] text-white">{submitting ? "Guardando..." : "Guardar Cambios"}</Button>
        </form>
      )}

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {/* Users table */}
      <div className="bg-white rounded-lg border border-[#DDE3EC] overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-[#8A96A8]">Cargando...</div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-[#4A5568]">No hay usuarios registrados</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#DDE3EC] bg-[#F8F9FB]">
                <th className="text-left px-4 py-3 font-medium text-[#4A5568]">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-[#4A5568]">Correo</th>
                <th className="text-left px-4 py-3 font-medium text-[#4A5568]">Rol</th>
                <th className="text-left px-4 py-3 font-medium text-[#4A5568]">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-[#4A5568]">Editado</th>
                <th className="text-left px-4 py-3 font-medium text-[#4A5568]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-[#DDE3EC] last:border-b-0 hover:bg-[#F8F9FB]">
                  <td className="px-4 py-3 text-[#0F1F3D] font-medium">{user.nombre}</td>
                  <td className="px-4 py-3 text-[#4A5568] font-mono text-xs">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${ROLE_BADGE[user.rol] ?? "bg-gray-100 text-gray-600"}`}>{user.rol}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${user.activo ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                      {user.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#8A96A8]">
                    {user.updatedAt !== user.createdAt ? new Date(user.updatedAt).toLocaleDateString("es-MX") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingUser(user); setShowForm(false); setCreatedUser(null); setResetResult(null); }}
                        className="text-xs text-[#E85D04] hover:underline">Editar</button>
                      <button onClick={() => handleResetPassword(user)}
                        className="text-xs text-blue-600 hover:underline">Reset Pass</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
