const CP_REGEX = /^[0-9]{5}$/;

export function validateCp(cp: string): boolean {
  if (!cp || typeof cp !== "string") return false;
  return CP_REGEX.test(cp.trim());
}
