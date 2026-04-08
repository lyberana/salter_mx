"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/searchable-select";
import { InlineCreateDialog } from "@/components/inline-create-dialog";

interface GuiaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultRemitenteId?: string;
  defaultConsignatarioId?: string;
  onPrint?: (guia: any) => void;
  onCreated?: (guia: { id: string; folio: string }) => void;
}

interface FormState {
  remitenteId: string;
  remitenteLabel: string;
  consignatarioId: string;
  consignatarioLabel: string;
  pesoKg: string;
  piezas: string;
  tipoContenido: string;
  numeroCuenta: string;
  comentarios: string;
}

interface FieldError {
  field: string;
  message: string;
}

const INITIAL_FORM: FormState = {
  remitenteId: "",
  remitenteLabel: "",
  consignatarioId: "",
  consignatarioLabel: "",
  pesoKg: "",
  piezas: "1",
  tipoContenido: "",
  numeroCuenta: "",
  comentarios: "",
};

export function GuiaFormDialog({
  open,
  onOpenChange,
  defaultRemitenteId,
  defaultConsignatarioId,
  onPrint,
  onCreated,
}: GuiaFormDialogProps) {
  const [form, setForm] = useState<FormState>(() => ({
    ...INITIAL_FORM,
    remitenteId: defaultRemitenteId ?? "",
    consignatarioId: defaultConsignatarioId ?? "",
  }));
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [saving, setSaving] = useState(false);
  const [inlineType, setInlineType] = useState<"remitente" | "consignatario" | null>(null);

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => prev.filter((e) => e.field !== field));
  }

  function getError(field: string) {
    return errors.find((e) => e.field === field)?.message;
  }

  const handleRemitenteChange = useCallback(
    (id: string, label: string) => {
      setForm((prev) => ({ ...prev, remitenteId: id, remitenteLabel: label }));
      setErrors((prev) => prev.filter((e) => e.field !== "remitenteId"));
    },
    []
  );

  const handleConsignatarioChange = useCallback(
    (id: string, label: string) => {
      setForm((prev) => ({ ...prev, consignatarioId: id, consignatarioLabel: label }));
      setErrors((prev) => prev.filter((e) => e.field !== "consignatarioId"));
    },
    []
  );

  function handleInlineCreated(id: string, name: string) {
    if (inlineType === "remitente") {
      handleRemitenteChange(id, name);
    } else if (inlineType === "consignatario") {
      handleConsignatarioChange(id, name);
    }
    setInlineType(null);
  }

  async function handleSubmit(andPrint: boolean) {
    setSaving(true);
    setErrors([]);

    const payload = {
      remitenteId: form.remitenteId,
      consignatarioId: form.consignatarioId,
      pesoKg: parseFloat(form.pesoKg) || 0,
      piezas: parseInt(form.piezas, 10) || 1,
      tipoContenido: form.tipoContenido || undefined,
      numeroCuenta: form.numeroCuenta || undefined,
      comentarios: form.comentarios || undefined,
    };

    try {
      const res = await fetch("/api/v1/guias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
            : [{ field: "", message: "Error al guardar la guía" }]
        );
        return;
      }

      const guia = json.data;
      resetAndClose();

      if (onCreated) {
        onCreated({ id: guia.id, folio: guia.folio });
      }

      if (andPrint && onPrint) {
        // Fetch full guía with relations for print
        try {
          const fullRes = await fetch(`/api/v1/guias/${guia.id}`);
          if (fullRes.ok) {
            const fullJson = await fullRes.json();
            onPrint(fullJson.data);
          }
        } catch {
          // If fetch fails, still close the dialog
        }
      }
    } catch {
      setErrors([{ field: "", message: "Error de conexión" }]);
    } finally {
      setSaving(false);
    }
  }

  function resetAndClose() {
    setForm({ ...INITIAL_FORM, remitenteId: defaultRemitenteId ?? "", consignatarioId: defaultConsignatarioId ?? "" });
    setErrors([]);
    onOpenChange(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetAndClose();
    } else {
      onOpenChange(true);
    }
  }

  const generalError = errors.find((e) => e.field === "")?.message;

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Guía</DialogTitle>
            <DialogDescription>Completa los datos para crear una nueva guía de envío.</DialogDescription>
          </DialogHeader>

          {generalError && (
            <p className="text-sm text-destructive">{generalError}</p>
          )}

          <div className="space-y-4">
            {/* Remitente */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Remitente <span className="text-destructive">*</span>
              </label>
              <SearchableSelect
                apiUrl="/api/v1/remitentes"
                value={form.remitenteId}
                onChange={handleRemitenteChange}
                placeholder="Buscar remitente..."
              />
              <button
                type="button"
                className="text-xs text-primary hover:underline mt-1"
                onClick={() => setInlineType("remitente")}
              >
                + Crear nuevo remitente
              </button>
              {getError("remitenteId") && (
                <p className="text-xs text-destructive mt-1">{getError("remitenteId")}</p>
              )}
            </div>

            {/* Consignatario */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Consignatario <span className="text-destructive">*</span>
              </label>
              <SearchableSelect
                apiUrl="/api/v1/consignatarios"
                value={form.consignatarioId}
                onChange={handleConsignatarioChange}
                placeholder="Buscar consignatario..."
              />
              <button
                type="button"
                className="text-xs text-primary hover:underline mt-1"
                onClick={() => setInlineType("consignatario")}
              >
                + Crear nuevo consignatario
              </button>
              {getError("consignatarioId") && (
                <p className="text-xs text-destructive mt-1">{getError("consignatarioId")}</p>
              )}
            </div>

            {/* Peso y Piezas */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Peso (kg) <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  step="0.001"
                  min="0"
                  value={form.pesoKg}
                  onChange={(e) => handleChange("pesoKg", e.target.value)}
                  placeholder="0.000"
                  aria-invalid={!!getError("pesoKg")}
                />
                {getError("pesoKg") && (
                  <p className="text-xs text-destructive mt-1">{getError("pesoKg")}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Piezas <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={form.piezas}
                  onChange={(e) => handleChange("piezas", e.target.value)}
                  placeholder="1"
                  aria-invalid={!!getError("piezas")}
                />
                {getError("piezas") && (
                  <p className="text-xs text-destructive mt-1">{getError("piezas")}</p>
                )}
              </div>
            </div>

            {/* Tipo de Contenido */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Tipo de Contenido
              </label>
              <Input
                value={form.tipoContenido}
                onChange={(e) => handleChange("tipoContenido", e.target.value)}
                placeholder="Ej. Documentos, Electrónicos..."
              />
            </div>

            {/* Número de Cuenta */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Número de Cuenta
              </label>
              <Input
                value={form.numeroCuenta}
                onChange={(e) => handleChange("numeroCuenta", e.target.value)}
                placeholder="Número de cuenta"
              />
            </div>

            {/* Comentarios */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Comentarios
              </label>
              <Textarea
                value={form.comentarios}
                onChange={(e) => handleChange("comentarios", e.target.value)}
                placeholder="Comentarios adicionales..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar e Imprimir"}
            </Button>
            <Button onClick={() => handleSubmit(false)} disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {inlineType && (
        <InlineCreateDialog
          type={inlineType}
          open={!!inlineType}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setInlineType(null);
          }}
          onCreated={handleInlineCreated}
        />
      )}
    </>
  );
}
