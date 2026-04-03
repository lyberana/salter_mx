import { alertaCritical, alertaThrottled } from "./alertas";
import { importacionProcesar } from "./importacion";

export const functions = [alertaCritical, alertaThrottled, importacionProcesar];
