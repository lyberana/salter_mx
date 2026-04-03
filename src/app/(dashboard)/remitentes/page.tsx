"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Remitente {
  id: string; nombre: string; rfc: string; calle: string; numExt: string;
  colonia: string; municipio: string; estado: string; cp: string;
  telefono: string; email: string; createdAt: string;
}

export default function RemitentesPage() {
  const [items, setItems] = useState<Remitente[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  async function fetchItems(q = "") {
    try {
      const res = await fetch(`/api/v1/remitentes?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (res.ok) setItems(json.data ?? []);
    } catch { setError("Error al cargar"); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchItems(); }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(""); setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      nombre: fd.get("nombre"), rfc: fd.get("rfc"), calle: fd.get("calle"),
      numExt: fd.get("numExt"), numInt: fd.get("numInt") || undefined,
      colonia: fd.get("colonia"), municipio: fd.get("municipio"),
      estado: fd.get("estado"), cp: fd.get("cp"),
      telefono: fd.get("telefono"), email: fd.get("email"),
    };
    try {
      const res = await fetch("/api/v1/remitentes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok) { setFormError(json.errors?.[0]?.message ?? "Error"); return; }
      setShowForm(false); fetchItems();
    } catch { setFormError("Error de conexión"); }
    finally { setSubmitting(false); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[#0F1F3D]">Remitentes</h1>
        <div className="flex gap-2">
          <a href="/api/v1/importacion/plantilla/remitentes" download className="inline-flex items-center h-9 px-3 rounded-md border border-[#DDE3EC] text-sm text-[#4A5568] hover:bg-[#F8F9FB]">📄 Plantilla CSV</a>
          <Button onClick={() => setShowForm(!showForm)} className="bg-[#E85D04] hover:bg-[#F48C06] text-white text-sm">
            {showForm ? "Cancelar" : "+ Nuevo Remitente"}
          </Button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-lg border border-[#DDE3EC] p-6 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-[#0F1F3D] mb-1">Nombre / Razón Social *</label><Input name="nombre" required placeholder="Empresa SA de CV" /></div>
            <div><label className="block text-sm font-medium text-[#0F1F3D] mb-1">RFC *</label><Input name="rfc" required placeholder="EEE010101AAA" minLength={12} maxLength={13} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-[#0F1F3D] mb-1">Calle *</label><Input name="calle" required placeholder="Av. Reforma" /></div>
            <div><label className="block text-sm font-medium text-[#0F1F3D] mb-1">Núm. Ext. *</label><Input name="numExt" required placeholder="100" /></div>
            <div><label className="block text-sm font-medium text-[#0F1F3D] mb-1">Núm. Int.</label><Input name="numInt" placeholder="A" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div><label className="block text-sm font-medium text-[#0F1F3D] mb-1">Colonia *</label><Input name="colonia" required placeholder="Centro" /></div>
            <div><label className="block text-sm font-medium text-[#0F1F3D] mb-1">Municipio *</label><Input name="municipio" required placeholder="Cuernavaca" /></div>
            <div><label className="block text-sm font-medium text-[#0F1F3D] mb-1">Estado *</label><Input name="estado" required placeholder="Morelos" /></div>
            <div><label className="block text-sm font-medium text-[#0F1F3D] mb-1">C.P. *</label><Input name="cp" required placeholder="62000" minLength={5} maxLength={5} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-[#0F1F3D] mb-1">Teléfono *</label><Input name="telefono" required placeholder="7771234567" /></div>
            <div><label className="block text-sm font-medium text-[#0F1F3D] mb-1">Email *</label><Input name="email" type="email" required placeholder="contacto@empresa.com" /></div>
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <Button type="submit" disabled={submitting} className="bg-[#E85D04] hover:bg-[#F48C06] text-white">{submitting ? "Creando..." : "Crear Remitente"}</Button>
        </form>
      )}

      <div className="mb-4">
        <Input placeholder="Buscar por nombre, RFC o CP..." value={search}
          onChange={e => { setSearch(e.target.value); fetchItems(e.target.value); }} />
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="bg-white rounded-lg border border-[#DDE3EC] overflow-hidden">
        {loading ? <div className="py-12 text-center text-[#8A96A8]">Cargando...</div>
        : items.length === 0 ? <div className="py-12 text-center text-[#4A5568]">No hay remitentes registrados</div>
        : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[#DDE3EC] bg-[#F8F9FB]">
              <th className="text-left px-4 py-3 font-medium text-[#4A5568]">Nombre</th>
              <th className="text-left px-4 py-3 font-medium text-[#4A5568]">RFC</th>
              <th className="text-left px-4 py-3 font-medium text-[#4A5568]">Municipio</th>
              <th className="text-left px-4 py-3 font-medium text-[#4A5568]">C.P.</th>
              <th className="text-left px-4 py-3 font-medium text-[#4A5568]">Teléfono</th>
            </tr></thead>
            <tbody>
              {items.map(r => (
                <tr key={r.id} className="border-b border-[#DDE3EC] last:border-b-0 hover:bg-[#F8F9FB]">
                  <td className="px-4 py-3 text-[#0F1F3D] font-medium">{r.nombre}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[#4A5568]">{r.rfc}</td>
                  <td className="px-4 py-3 text-[#4A5568]">{r.municipio}, {r.estado}</td>
                  <td className="px-4 py-3 font-mono text-[#4A5568]">{r.cp}</td>
                  <td className="px-4 py-3 text-[#4A5568]">{r.telefono}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
