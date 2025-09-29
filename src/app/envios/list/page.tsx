"use client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Layout from "@/components/layout";

type Envio = {
  id: number;
  folio: string;
  peso: number;
  comentarios: string;
  fecha: string;
  remitente_nombre: string;
  remitente_direccion: string;
  remitente_telefono: string;
  consignatario_nombre: string;
  consignatario_direccion: string;
  consignatario_telefono: string;
};

export default function EnviosList() {
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Envio | null>(null);

  useEffect(() => {
    fetch("/api/envios")
      .then((res) => res.json())
      .then((data) => setEnvios(data));
  }, []);

  const filtered = envios.filter(
    (envio) =>
      envio.folio.includes(search) ||
      envio.remitente_nombre?.toLowerCase().includes(search.toLowerCase()) ||
      envio.consignatario_nombre?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    const confirmed = confirm("¿Estás segura que quieres eliminar este envío?");
    if (!confirmed) return;

    await fetch(`/api/envios?id=${id}`, { method: "DELETE" });
    setEnvios(envios.filter((e) => e.id !== id));
    setSelected(null);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto mt-10 space-y-4">
        <h2 className="text-xl font-bold">📦 Envíos Registrados</h2>
        <input
          type="text"
          placeholder="Buscar por folio, remitente o consignatario"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 border rounded-md"
        />

        {filtered.map((envio) => (
          <Dialog key={envio.id}>
            <DialogTrigger asChild>
              <div
                className="border p-4 rounded-md shadow-sm bg-white cursor-pointer hover:bg-gray-50"
                onClick={() => setSelected(envio)}
              >
                <p>
                  <strong>Folio:</strong> {envio.folio}
                </p>
                <p>
                  <strong>Peso:</strong> {envio.peso} kg
                </p>
                <p>
                  <strong>Remitente:</strong> {envio.remitente_nombre || "—"}
                </p>
                <p>
                  <strong>Consignatario:</strong>{" "}
                  {envio.consignatario_nombre || "—"}
                </p>
              </div>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>📦 Detalles del Envío</DialogTitle>
                <DialogDescription>
                  <div>
                    <strong>Folio:</strong> {selected?.folio}
                  </div>
                  <div>
                    <strong>Peso:</strong> {selected?.peso} kg
                  </div>
                  <div>
                    <strong>Comentarios:</strong> {selected?.comentarios}
                  </div>
                  <div>
                    <strong>Fecha:</strong>{" "}
                    {new Date(selected?.fecha || "").toLocaleDateString(
                      "es-MX"
                    )}
                  </div>
                  <hr className="my-2" />
                  <div>
                    <strong>Remitente:</strong> {selected?.remitente_nombre}
                  </div>
                  <div>
                    <strong>Dirección:</strong> {selected?.remitente_direccion}
                  </div>
                  <div>
                    <strong>Teléfono:</strong> {selected?.remitente_telefono}
                  </div>
                  <hr className="my-2" />
                  <span>
                    <strong>Consignatario:</strong>{" "}
                    {selected?.consignatario_nombre}
                  </span>
                  <div>
                    <strong>Dirección:</strong>{" "}
                    {selected?.consignatario_direccion}
                  </div>
                  <div>
                    <strong>Teléfono:</strong>{" "}
                    {selected?.consignatario_telefono}
                  </div>
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 flex gap-4">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => alert(`Edit envio ${selected?.id}`)}
                >
                  ✏️ Editar
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => handleDelete(selected?.id)}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </Layout>
  );
}
