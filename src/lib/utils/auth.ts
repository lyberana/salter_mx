export type UserRole = "administrador" | "coordinador" | "operador" | "cliente";

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  administrador: 4,
  coordinador: 3,
  operador: 2,
  cliente: 1,
};

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function hasAnyRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

export function isAdmin(role: UserRole): boolean {
  return role === "administrador";
}

export function canManageFleet(role: UserRole): boolean {
  return hasAnyRole(role, ["administrador", "coordinador"]);
}

export function canManageOrders(role: UserRole): boolean {
  return hasAnyRole(role, ["administrador", "coordinador"]);
}

export function canViewTracking(role: UserRole): boolean {
  return hasAnyRole(role, ["administrador", "coordinador", "operador", "cliente"]);
}
