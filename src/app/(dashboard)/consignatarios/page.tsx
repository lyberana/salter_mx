"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBreadcrumbOverrides } from "@/lib/context/breadcrumb-context";
import { useSelectedEntity } from "@/lib/context/selected-entity-context";

interface Consignatario {
  id: string; nombre: string; rfc: string; calle: string; numExt: string;
  numInt?: string; colonia: string; municipio: string; estado: string; cp: string;
  telefono: string; email: string; createdAt: string;
}

export default function ConsignatariosPage() {
  const [items, setItems] = useState<Consignatario[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Consignatario | null>(null);
  const [editError, setEditError] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const { setOverride } = useBreadcrumbOverrides();
  const { setSelected } = useSelectedEntity();

  function handleExpand(c: Consignatario) {
    const isExpanding = expandedId !== c.id;
    setExpandedId(isExpanding ? c.id : null);
    setEditing(null);
    setEditError("");
    if (isExpanding) {
      setOverride("consignatarios", "Consignatarios");
      setOverride(c.id, c.nombre);
      setSelected({ type: "consignatario", id: c.id, name: c.nombre });
    } else {
      setOverride(c.id, "");
      setSelected(null);
    }
  }

  async function fetchItems(q = "") {
    try {
      const res = await fetch(`/api/v1/consignatarios?q=${encodeURIComponent(q)}`);
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
      const res = await fetch("/api/v1/consignatarios", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok) { setFormError(json.errors?.[0]?.message ?? "Error"); return; }
      setShowForm(false); fetchItems();
    } catch { setFormError("Error de conexión"); }
    finally { setSubmitting(false); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[#0F1F3D]">Consignatarios</h1>
        <div className="flex gap-2">
          <a href="/api/v1/importacion/plantilla/consignatarios" download className="inline-flex items-center h-9 px-3 rounded-md border border-[#DDE3EC] text-sm text-[#4A5568] hover:bg-[#F8F9FB]">📄 Plantilla CSV</a>
          <Button onClick={() => setShowForm(!showForm)} className="bg-[#E85D04] hover:bg-[#F48C06] text-white text-sm">
            {showForm ? "Cancelar" : "+ Nuevo Consignatario"}
          </Button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-lg border border-[#DDE3EC] p-6 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-[#0F1F3D] mb-1">Nombre / Razón Social *</label><Input name="nombre" required placeholder="Distribuidora SA" /></div>
            <div><label className="block text-sm font-medium text-[#0F1F3D] mb-1">RFC *</label><Input name="rfc" required placeholder="DNO020202BBB" minLength={12} maxLength={13} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-[#0F1F3D] mb-1">Calle *</label><Input name="calle" required placeholder="Calle 5 de Mayo" /></div>
            <div><label className="block text-sm font-medium text-[#0F1F3D] mb-1">Núm. Ext. *</label><Input name="numExt" required placeholder="50" /></div>
            <div><label className="block text-sm font-medium text-[#0F1F3D] mb-1">Núm. Int.</label><Input name="numInt" placeholder="A" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div><label className="block text-sm font-medium text-[#0F1F3D] mb-1">Colonia *</label><Input name="colonia" required placeholder="Centro" /></div>
            <div><label className="block text-sm font-medium text-[#0F1F3D] mb-1">Municipio *</label><Input name="municipio" required placeholder="CDMX" /></div>
            <div><label className="block text-sm font-medium text-[#0F1F3D] mb-1">Estado *</label><Input name="estado" required placeholder="Ciudad de México" /></div>
            <div><label className="block text-sm font-medium text-[#0F1F3D] mb-1">C.P. *</label><Input name="cp" required placeholder="06000" minLength={5} maxLength={5} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-[#0F1F3D] mb-1">Teléfono *</label><Input name="telefono" required placeholder="5551234567" /></div>
            <div><label className="block text-sm font-medium text-[#0F1F3D] mb-1">Email *</label><Input name="email" type="email" required placeholder="ventas@empresa.com" /></div>
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <Button type="submit" disabled={submitting} className="bg-[#E85D04] hover:bg-[#F48C06] text-white">{submitting ? "Creando..." : "Crear Consignatario"}</Button>
        </form>
      )}

      <div className="mb-4">
        <Input placeholder="Buscar por nombre, RFC o CP..." value={search}
          onChange={e => { setSearch(e.target.value); fetchItems(e.target.value); }} />
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="bg-white rounded-lg border border-[#DDE3EC] overflow-hidden">
        {loading ? <div className="py-12 text-center text-[#8A96A8]">Cargando...</div>
        : items.length === 0 ? <div className="py-12 text-center text-[#4A5568]">No hay consignatarios registrados</div>
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
              {items.map(c => (
                <React.Fragment key={c.id}>
                  <tr className="border-b border-[#DDE3EC] last:border-b-0 hover:bg-[#F8F9FB] cursor-pointer" onClick={() => handleExpand(c)}>
                    <td className="px-4 py-3 text-[#E85D04] font-medium hover:underline">{c.nombre}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#4A5568]">{c.rfc}</td>
                    <td className="px-4 py-3 text-[#4A5568]">{c.municipio}, {c.estado}</td>
                    <td className="px-4 py-3 font-mono text-[#4A5568]">{c.cp}</td>
                    <td className="px-4 py-3 text-[#4A5568]">{c.telefono}</td>
                  </tr>
                  {expandedId === c.id && (
                    <tr><td colSpan={5} className="px-4 py-4 bg-[#F8F9FB]">
                      {editing?.id === c.id ? (
                        <EditFormC
                          item={editing}
                          onChange={setEditing}
                          error={editError}
                          submitting={editSubmitting}
                          onSave={async () => {
                            setEditSubmitting(true); setEditError("");
                            try {
                              const res = await fetch(`/api/v1/consignatarios`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...editing, _update: true }) });
                              if (!res.ok) { const j = await res.json(); setEditError(j.errors?.[0]?.message ?? "Error"); return; }
                              setEditing(null); fetchItems(search);
                            } catch { setEditError("Error de conexión"); }
                            finally { setEditSubmitting(false); }
                          }}
                          onCancel={() => { setEditing(null); setEditError(""); }}
                        />
                      ) : (
                        <div>
                          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm mb-4">
                            <div><dt className="text-xs text-[#8A96A8]">Nombre</dt><dd className="text-[#0F1F3D]">{c.nombre}</dd></div>
                            <div><dt className="text-xs text-[#8A96A8]">RFC</dt><dd className="text-[#0F1F3D] font-mono">{c.rfc}</dd></div>
                            <div><dt className="text-xs text-[#8A96A8]">Dirección</dt><dd className="text-[#0F1F3D]">{c.calle} {c.numExt}{c.numInt ? ` Int. ${c.numInt}` : ""}</dd></div>
                            <div><dt className="text-xs text-[#8A96A8]">Colonia</dt><dd className="text-[#0F1F3D]">{c.colonia}</dd></div>
                            <div><dt className="text-xs text-[#8A96A8]">Municipio, Estado</dt><dd className="text-[#0F1F3D]">{c.municipio}, {c.estado}</dd></div>
                            <div><dt className="text-xs text-[#8A96A8]">C.P.</dt><dd className="text-[#0F1F3D] font-mono">{c.cp}</dd></div>
                            <div><dt className="text-xs text-[#8A96A8]">Teléfono</dt><dd className="text-[#0F1F3D]">{c.telefono}</dd></div>
                            <div><dt className="text-xs text-[#8A96A8]">Email</dt><dd className="text-[#0F1F3D]">{c.email}</dd></div>
                            <div><dt className="text-xs text-[#8A96A8]">Creado</dt><dd className="text-[#0F1F3D]">{new Date(c.createdAt).toLocaleDateString("es-MX")}</dd></div>
                          </dl>
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setEditing({...c}); }}>Editar</Button>
                        </div>
                      )}
                    </td></tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}


function EditFormC({ item, onChange, error, submitting, onSave, onCancel }: {
  item: Consignatario; onChange: (c: Consignatario) => void; error: string; submitting: boolean;
  onSave: () => void; onCancel: () => void;
}) {
  function set(field: keyof Consignatario, value: string) { onChange({ ...item, [field]: value }); }
  return (
    <div className="space-y-3" onClick={e => e.stopPropagation()}>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div><label className="block text-xs text-[#8A96A8] mb-1">Nombre *</label><Input value={item.nombre} onChange={e => set("nombre", e.target.value)} /></div>
        <div><label className="block text-xs text-[#8A96A8] mb-1">RFC *</label><Input value={item.rfc} onChange={e => set("rfc", e.target.value)} /></div>
        <div><label className="block text-xs text-[#8A96A8] mb-1">Calle *</label><Input value={item.calle} onChange={e => set("calle", e.target.value)} /></div>
        <div><label className="block text-xs text-[#8A96A8] mb-1">Núm. Ext. *</label><Input value={item.numExt} onChange={e => set("numExt", e.target.value)} /></div>
        <div><label className="block text-xs text-[#8A96A8] mb-1">Núm. Int.</label><Input value={item.numInt ?? ""} onChange={e => set("numInt", e.target.value)} /></div>
        <div><label className="block text-xs text-[#8A96A8] mb-1">Colonia *</label><Input value={item.colonia} onChange={e => set("colonia", e.target.value)} /></div>
        <div><label className="block text-xs text-[#8A96A8] mb-1">Municipio *</label><Input value={item.municipio} onChange={e => set("municipio", e.target.value)} /></div>
        <div><label className="block text-xs text-[#8A96A8] mb-1">Estado *</label><Input value={item.estado} onChange={e => set("estado", e.target.value)} /></div>
        <div><label className="block text-xs text-[#8A96A8] mb-1">C.P. *</label><Input value={item.cp} onChange={e => set("cp", e.target.value)} /></div>
        <div><label className="block text-xs text-[#8A96A8] mb-1">Teléfono *</label><Input value={item.telefono} onChange={e => set("telefono", e.target.value)} /></div>
        <div><label className="block text-xs text-[#8A96A8] mb-1">Email *</label><Input value={item.email} onChange={e => set("email", e.target.value)} /></div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" onClick={onSave} disabled={submitting} className="bg-[#E85D04] hover:bg-[#F48C06] text-white">{submitting ? "Guardando..." : "Guardar"}</Button>
        <Button size="sm" variant="outline" onClick={onCancel} disabled={submitting}>Cancelar</Button>
      </div>
    </div>
  );
}
