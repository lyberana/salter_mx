import * as XLSX from "xlsx";

export interface ParsedRow {
  rowNumber: number;
  data: Record<string, string>;
}

export type Entidad = "remitentes" | "consignatarios" | "envios";

export function parseFile(buffer: Buffer, filename: string): ParsedRow[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];

  const jsonRows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
    defval: "",
  });

  return jsonRows.map((data, index) => ({
    rowNumber: index + 2, // +2 because row 1 is headers, data starts at row 2
    data,
  }));
}
