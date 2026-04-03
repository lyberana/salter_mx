import { validateRfc } from "@/lib/utils/rfc";
import { validateCp } from "@/lib/utils/cp";
import type { ParsedRow, Entidad } from "./parser";

export interface RowError {
  rowNumber: number;
  field: string;
  message: string;
}

export interface ValidationReport {
  totalRegistros: number;
  registrosValidos: number;
  registrosError: number;
  errors: RowError[];
  validRows: ParsedRow[];
}

const REQUIRED_FIELDS: Record<Entidad, string[]> = {
  remitentes: [
    "nombre",
    "rfc",
    "calle",
    "numExt",
    "colonia",
    "municipio",
    "estado",
    "cp",
    "telefono",
    "email",
  ],
  consignatarios: [
    "nombre",
    "rfc",
    "calle",
    "numExt",
    "colonia",
    "municipio",
    "estado",
    "cp",
    "telefono",
    "email",
  ],
  envios: [
    "folio",
    "pesoKg",
    "tipoContenido",
    "remitenteId",
    "consignatarioId",
  ],
};

export function validateRows(
  rows: ParsedRow[],
  entidad: Entidad,
): ValidationReport {
  const errors: RowError[] = [];
  const validRows: ParsedRow[] = [];
  const requiredFields = REQUIRED_FIELDS[entidad];
  const seenKeys = new Set<string>();

  for (const row of rows) {
    let rowValid = true;

    // Check required fields
    for (const field of requiredFields) {
      if (!row.data[field]?.trim()) {
        errors.push({
          rowNumber: row.rowNumber,
          field,
          message: `Campo requerido "${field}" está vacío`,
        });
        rowValid = false;
      }
    }

    // Validate RFC if present
    if (row.data.rfc && !validateRfc(row.data.rfc)) {
      errors.push({
        rowNumber: row.rowNumber,
        field: "rfc",
        message: "RFC no cumple el formato SAT",
      });
      rowValid = false;
    }

    // Validate CP if present
    if (row.data.cp && !validateCp(row.data.cp)) {
      errors.push({
        rowNumber: row.rowNumber,
        field: "cp",
        message: "CP debe tener exactamente 5 dígitos",
      });
      rowValid = false;
    }

    // Check for duplicates within file
    // By RFC + nombre for remitentes/consignatarios, by folio for envíos
    const dedupeKey =
      entidad === "envios"
        ? row.data.folio?.trim()
        : `${row.data.rfc?.trim()}-${row.data.nombre?.trim()}`;

    if (dedupeKey && seenKeys.has(dedupeKey)) {
      errors.push({
        rowNumber: row.rowNumber,
        field: entidad === "envios" ? "folio" : "rfc",
        message: "Registro duplicado dentro del archivo",
      });
      rowValid = false;
    } else if (dedupeKey) {
      seenKeys.add(dedupeKey);
    }

    if (rowValid) validRows.push(row);
  }

  return {
    totalRegistros: rows.length,
    registrosValidos: validRows.length,
    registrosError: rows.length - validRows.length,
    errors,
    validRows,
  };
}
