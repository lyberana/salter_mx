"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface InlineCreateDialogProps {
  type: "remitente" | "consignatario";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (id: string, name: string) => void;
}

interface FieldError {
  field: string;
  message: string;
}

const FIELDS = [
  { name: "nombre", label: "Nombre", required: true },
  { name: "rfc", label: "RFC", required: true },
  { name: "calle", label: "Calle", required: true },
  { name: "numExt", label: "Núm. Exterior", required: true },
  { name: "numInt", label: "Núm. Interior", required: false },
  { name: "colonia", label: "Colonia", required: true },
  { name: "municipio", label: "Municipio", required: true },
  { name: "estado", label: "Estado", required: true },
  { name: "cp", label: "Código Postal", required: true },
  { name: "telefono", label: "Teléfono", required: true },
  { name: "email", label: "Email", required: true },
] as const;

type FormData = Record<string, string>;

export function InlineCreateDialog({
  type,
  open,
  onOpenChange,
  onCreated,
}: InlineCreateDialogProps) {
  const [form, setForm] = useState<FormData>({});
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [saving, setSaving] = useState(false);

  const title = type === "remitente" ? "Nuevo Remitente" : "Nuevo Consignatario";
  const apiUrl =
    type === "remitente" ? "/api/v1/remitentes" : "/api/v1/consignatarios";

  function handleChange(name: string, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => prev.filter((e) => e.field !== name));
  }

  function getError(name: string) {
    return errors.find((e) => e.field === name)?.message;
  }

  async function handleSubmit() {
    setSaving(true);
    setErrors([]);

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok) {
        const fieldErrors: FieldError[] = (json.errors ?? []).map(
          (e: { field?: string; message?: string }) => ({
            field: e.field ?? "",
            message: e.message ?? "Error de validación",
          })
        );
        setErrors(
          fieldErrors.length > 0
            ? fieldErrors
            : [{ field: "", message: "Error al guardar" }]
        );
        return;
      }

      const created = json.data;
      onCreated(created.id, created.nombre);
      setForm({});
      onOpenChange(false);
    } catch {
      setErrors([{ field: "", message: "Error de conexión" }]);
    } finally {
      setSaving(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setForm({});
      setErrors([]);
    }
    onOpenChange(nextOpen);
  }

  const generalError = errors.find((e) => e.field === "")?.message;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Completa los datos para crear un nuevo {type === "remitente" ? "remitente" : "consignatario"}.</DialogDescription>
        </DialogHeader>

        {generalError && (
          <p className="text-sm text-destructive">{generalError}</p>
        )}

        <div className="grid grid-cols-2 gap-3">
          {FIELDS.map((f) => (
            <div
              key={f.name}
              className={f.name === "nombre" ? "col-span-2" : ""}
            >
              <label className="text-sm font-medium text-foreground mb-1 block">
                {f.label}
                {f.required && <span className="text-destructive ml-0.5">*</span>}
              </label>
              <Input
                value={form[f.name] ?? ""}
                onChange={(e) => handleChange(f.name, e.target.value)}
                placeholder={f.label}
                aria-invalid={!!getError(f.name)}
              />
              {getError(f.name) && (
                <p className="text-xs text-destructive mt-1">
                  {getError(f.name)}
                </p>
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
