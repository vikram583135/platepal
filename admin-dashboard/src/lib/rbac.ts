/**
 * Role-Based Access Control (RBAC) Utilities
 */

export type Role = 'admin' | 'super_admin' | 'support' | 'moderator';

export type Permission = 
  | 'view_dashboard'
  | 'manage_orders'
  | 'manage_restaurants'
  | 'approve_restaurants'
  | 'suspend_restaurants'
  | 'manage_delivery_partners'
  | 'manage_customers'
  | 'view_analytics'
  | 'manage_support_tickets'
  | 'manage_users'
  | 'system_settings';

export interface RolePermissions {
  [key: string]: Permission[];
}

// Define permissions for each role
export const ROLE_PERMISSIONS: RolePermissions = {
  super_admin: [
    'view_dashboard',
    'manage_orders',
    'manage_restaurants',
    'approve_restaurants',
    'suspend_restaurants',
    'manage_delivery_partners',
    'manage_customers',
    'view_analytics',
    'manage_support_tickets',
    'manage_users',
    'system_settings',
  ],
  admin: [
    'view_dashboard',
    'manage_orders',
    'manage_restaurants',
    'approve_restaurants',
    'suspend_restaurants',
    'manage_delivery_partners',
    'manage_customers',
    'view_analytics',
    'manage_support_tickets',
  ],
  support: [
    'view_dashboard',
    'view_analytics',
    'manage_support_tickets',
    'manage_customers',
  ],
  moderator: [
    'view_dashboard',
    'manage_orders',
    'manage_restaurants',
    'manage_delivery_partners',
    'manage_customers',
  ],
};

/**
 * Check if a user has a specific permission
 */
export function hasPermission(userRole: Role | undefined, permission: Permission): boolean {
  if (!userRole) return false;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(userRole: Role | undefined, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(userRole: Role | undefined, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Protected component wrapper (to be used with React components)
 */
export function requirePermission(permission: Permission) {
  return (userRole: Role | undefined): boolean => {
    return hasPermission(userRole, permission);
  };
}

