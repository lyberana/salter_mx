"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/components/layout";

export default function EnviosForm() {
  const [folio, setFolio] = useState("");
  const [peso, setPeso] = useState("");
  const [comentarios, setComentarios] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await fetch("/api/envios", {
      method: "POST",
      body: JSON.stringify({ folio, peso, comentarios }),
      headers: { "Content-Type": "application/json" },
    });
    alert("Envío registrado!");
  };

  return (
    <Layout>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-w-md mx-auto mt-10"
      >
        <Input
          placeholder="Folio"
          value={folio}
          onChange={(e) => setFolio(e.target.value)}
        />
        <Input
          placeholder="Peso (kg)"
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
        />
        <Textarea
          placeholder="Comentarios"
          value={comentarios}
          onChange={(e) => setComentarios(e.target.value)}
        />
        <Button type="submit">Registrar Envío</Button>
      </form>
    </Layout>
  );
}
