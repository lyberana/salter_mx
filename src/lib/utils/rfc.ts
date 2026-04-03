// SAT RFC patterns
// Persona moral (empresa): 3 letters + 6 digits (YYMMDD) + 3 alphanumeric = 12 chars
const RFC_MORAL_REGEX = /^[A-ZÑ&]{3}[0-9]{6}[A-Z0-9]{3}$/;
// Persona física (individual): 4 letters + 6 digits (YYMMDD) + 3 alphanumeric = 13 chars
const RFC_FISICA_REGEX = /^[A-ZÑ&]{4}[0-9]{6}[A-Z0-9]{3}$/;

export function validateRfc(rfc: string): boolean {
  if (!rfc || typeof rfc !== "string") return false;
  const upper = rfc.toUpperCase().trim();
  return RFC_MORAL_REGEX.test(upper) || RFC_FISICA_REGEX.test(upper);
}

export function getRfcType(rfc: string): "moral" | "fisica" | null {
  if (!rfc) return null;
  const upper = rfc.toUpperCase().trim();
  if (RFC_MORAL_REGEX.test(upper)) return "moral";
  if (RFC_FISICA_REGEX.test(upper)) return "fisica";
  return null;
}
