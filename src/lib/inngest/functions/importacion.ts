import { inngest } from "@/lib/inngest/client";
import { logger } from "@/lib/logger";
import { db } from "@/lib/db";
import { importaciones } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { parseFile, type Entidad } from "@/lib/services/importacion/parser";
import { validateRows } from "@/lib/services/importacion/validator";
import * as remitenteRepo from "@/lib/repositories/remitentes";
import { logEvent } from "@/lib/services/auditLog";

export const importacionProcesar = inngest.createFunction(
  { id: "importacion-procesar", name: "Procesar Importación" },
  { event: "importacion/procesar" },
  async ({ event }) => {
    const { importacionId, fileBuffer, filename, entidad, userId, dryRun } = event.data as {
      importacionId: string;
      fileBuffer: string; // base64 encoded
      filename: string;
      entidad: Entidad;
      userId: string;
      dryRun: boolean;
    };

    logger.info({ event: "importacion.started", importacionId, entidad, dryRun });

    // Update status to procesando
    await db.update(importaciones)
      .set({ estado: "procesando", updatedAt: new Date() })
      .where(eq(importaciones.id, importacionId));

    try {
      // Parse file
      const buffer = Buffer.from(fileBuffer, "base64");
      const rows = parseFile(buffer, filename);

      // Validate rows
      const report = validateRows(rows, entidad);

      // Check for existing duplicates in DB (RFC + nombre)
      if (!dryRun && (entidad === "remitentes" || entidad === "consignatarios")) {
        const finalValidRows = [];
        for (const row of report.validRows) {
          const searchKey = row.data.rfc?.trim();
          if (searchKey) {
            const existing = entidad === "remitentes"
              ? await remitenteRepo.searchRemitentes(searchKey)
              : await remitenteRepo.searchConsignatarios(searchKey);
            const isDuplicate = existing.some(
              e => e.rfc === row.data.rfc?.trim() && e.nombre === row.data.nombre?.trim()
            );
            if (isDuplicate) {
              report.errors.push({
                rowNumber: row.rowNumber,
                field: "rfc",
                message: "Duplicado existente en la base de datos",
              });
              report.registrosError++;
              report.registrosValidos--;
              continue;
            }
          }
          finalValidRows.push(row);
        }
        report.validRows = finalValidRows;
      }

      // Persist valid rows (unless dry-run)
      let imported = 0;
      if (!dryRun) {
        for (const row of report.validRows) {
          try {
            if (entidad === "remitentes") {
              await remitenteRepo.createRemitente({
                nombre: row.data.nombre,
                rfc: row.data.rfc,
                calle: row.data.calle,
                numExt: row.data.numExt,
                numInt: row.data.numInt || undefined,
                colonia: row.data.colonia,
                municipio: row.data.municipio,
                estado: row.data.estado,
                cp: row.data.cp,
                telefono: row.data.telefono,
                email: row.data.email,
              });
            } else if (entidad === "consignatarios") {
              await remitenteRepo.createConsignatario({
                nombre: row.data.nombre,
                rfc: row.data.rfc,
                calle: row.data.calle,
                numExt: row.data.numExt,
                numInt: row.data.numInt || undefined,
                colonia: row.data.colonia,
                municipio: row.data.municipio,
                estado: row.data.estado,
                cp: row.data.cp,
                telefono: row.data.telefono,
                email: row.data.email,
              });
            }
            imported++;
          } catch (err) {
            logger.warn({ err, rowNumber: row.rowNumber }, "Failed to import row");
            report.registrosError++;
          }
        }
      }

      // Update importacion record
      await db.update(importaciones)
        .set({
          estado: "completado",
          totalRegistros: report.totalRegistros,
          registrosValidos: dryRun ? report.registrosValidos : imported,
          registrosError: report.registrosError,
          updatedAt: new Date(),
        })
        .where(eq(importaciones.id, importacionId));

      // Audit log
      await logEvent({
        nivel: "info",
        evento: "importacion.completada",
        userId,
        entidad: "importaciones",
        entidadId: importacionId,
        payload: {
          filename,
          entidad,
          dryRun,
          totalRegistros: report.totalRegistros,
          registrosValidos: dryRun ? report.registrosValidos : imported,
          registrosError: report.registrosError,
        },
      });

      // TODO: Send email notification to admin (R2 Task 41)
      logger.info({
        event: "importacion.completed",
        importacionId,
        imported,
        errors: report.registrosError,
      });

      return { importacionId, imported, errors: report.registrosError, dryRun };
    } catch (err) {
      await db.update(importaciones)
        .set({ estado: "fallido", updatedAt: new Date() })
        .where(eq(importaciones.id, importacionId));

      logger.error({ err, importacionId }, "Import job failed");
      throw err;
    }
  }
);
