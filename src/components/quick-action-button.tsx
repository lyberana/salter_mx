"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Plus, CheckCircle2, X } from "lucide-react";
import { GuiaFormDialog } from "@/components/guia-form-dialog";
import { useSelectedEntity } from "@/lib/context/selected-entity-context";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface QuickActionButtonProps {
  defaultRemitenteId?: string;
}

interface CreatedGuia {
  id: string;
  folio: string;
}

export function QuickActionButton({ defaultRemitenteId }: QuickActionButtonProps) {
  const { data: session } = useSession();
  const { selected } = useSelectedEntity();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<CreatedGuia | null>(null);

  const userRole = (session?.user as any)?.role;
  if (userRole !== "coordinador" && userRole !== "administrador") {
    return null;
  }

  // Determine pre-fill from selected entity or prop
  const prefilledRemitenteId = selected?.type === "remitente" ? selected.id : defaultRemitenteId;
  const prefilledConsignatarioId = selected?.type === "consignatario" ? selected.id : undefined;

  function handleCreated(guia: CreatedGuia) {
    setToast(guia);
  }

  function dismissToast() {
    setToast(null);
  }

  return (
    <>
      {/* Success toast */}
      {toast && <SuccessToast guia={toast} onDismiss={dismissToast} />}

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg flex items-center justify-center bg-[#0F1F3D] hover:bg-[#E85D04] hover:scale-110 transition-all duration-200 cursor-pointer"
            onClick={() => setOpen(true)}
            aria-label="Nueva Guía"
          >
            <Plus className="size-6 text-white" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-[#E85D04] text-white border-[#E85D04] font-medium px-4 py-2"
        >
          Nueva Guía
        </TooltipContent>
      </Tooltip>
      <GuiaFormDialog
        open={open}
        onOpenChange={setOpen}
        defaultRemitenteId={prefilledRemitenteId}
        defaultConsignatarioId={prefilledConsignatarioId}
        onCreated={handleCreated}
      />
    </>
  );
}

function SuccessToast({ guia, onDismiss }: { guia: CreatedGuia; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 shadow-lg">
        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
        <div className="text-sm">
          <span className="text-green-800">Guía creada: </span>
          <Link
            href={`/guias/${guia.id}`}
            className="font-semibold text-green-700 hover:text-green-900 underline underline-offset-2"
            onClick={onDismiss}
          >
            {guia.folio}
          </Link>
        </div>
        <button
          onClick={onDismiss}
          className="text-green-400 hover:text-green-600 ml-2"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
