"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GuiaPrintLayout, type GuiaPrintData } from "@/components/guia-print-layout";

interface GuiaPrintPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guia: GuiaPrintData;
}

const DEFAULT_COPIES = 3;
const MIN_COPIES = 1;
const MAX_COPIES = 10;

export function GuiaPrintPreview({ open, onOpenChange, guia }: GuiaPrintPreviewProps) {
  const [copies, setCopies] = useState<number>(DEFAULT_COPIES);
  const [copiesError, setCopiesError] = useState<string>("");
  const [loadedDefault, setLoadedDefault] = useState(false);

  useEffect(() => {
    if (!open || loadedDefault) return;
    fetch("/api/v1/system-config")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data?.default_copies) {
          const val = Number(json.data.default_copies);
          if (Number.isInteger(val) && val >= MIN_COPIES && val <= MAX_COPIES) setCopies(val);
        }
        setLoadedDefault(true);
      })
      .catch(() => setLoadedDefault(true));
  }, [open, loadedDefault]);

  function handleCopiesChange(value: string) {
    const num = parseInt(value, 10);
    if (isNaN(num)) { setCopiesError("Ingrese un número válido"); setCopies(MIN_COPIES); return; }
    if (!Number.isInteger(num) || num < MIN_COPIES || num > MAX_COPIES) { setCopiesError(`Debe ser entre ${MIN_COPIES} y ${MAX_COPIES}`); setCopies(num); return; }
    setCopiesError(""); setCopies(num);
  }

  function handlePrint() { if (!copiesError) window.print(); }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) { setLoadedDefault(false); setCopiesError(""); }
    onOpenChange(nextOpen);
  }

  const validCopies = !copiesError && copies >= MIN_COPIES && copies <= MAX_COPIES ? copies : MIN_COPIES;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto print-preview-dialog">
        <DialogHeader className="no-print">
          <DialogTitle>Vista Previa de Impresión</DialogTitle>
          <DialogDescription>Revisa la guía antes de imprimir. Puedes ajustar el número de copias.</DialogDescription>
        </DialogHeader>
        <div className="no-print flex items-center gap-4 pb-2 border-b">
          <label className="text-sm font-medium whitespace-nowrap" htmlFor="copies-input">Copias:</label>
          <Input id="copies-input" type="number" min={MIN_COPIES} max={MAX_COPIES} step={1} value={copies} onChange={(e) => handleCopiesChange(e.target.value)} className="w-20" aria-invalid={!!copiesError} />
          {copiesError && <span className="text-xs text-destructive">{copiesError}</span>}
        </div>
        <div className="print-area">
          {Array.from({ length: validCopies }, (_, i) => (
            <div key={i} className="print-page" style={{ pageBreakAfter: i < validCopies - 1 ? "always" : "auto", marginBottom: i < validCopies - 1 ? "24px" : "0" }}>
              <GuiaPrintLayout guia={guia} />
            </div>
          ))}
        </div>
        <DialogFooter className="no-print">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cerrar</Button>
          <Button onClick={handlePrint} disabled={!!copiesError}>Imprimir</Button>
        </DialogFooter>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area { position: absolute; left: 0; top: 0; width: 100%; }
            .no-print { display: none !important; }
            .print-preview-dialog { position: static; border: none; box-shadow: none; max-height: none; overflow: visible; padding: 0; max-width: none; transform: none; }
            .print-page { page-break-after: always; margin-bottom: 0 !important; }
            .print-page:last-child { page-break-after: auto; }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
