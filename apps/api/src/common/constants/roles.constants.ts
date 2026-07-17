import { UserRole } from '@prisma/client';

/** Roles with equal school-administration rights (school profile, semesters,
 * calendar publishing, scoring schemas, announcements, news). No hierarchy
 * between them yet — see ticket 012's RBAC matrix. */
export const ADMIN_TIER_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.PRINCIPAL,
  UserRole.VICE_PRINCIPAL,
  UserRole.SUPER_ADMIN,
];

/** Roles that may be assigned to another user by an admin-tier caller who is
 * not SUPER_ADMIN. Granting ADMIN_TIER_ROLES requires SUPER_ADMIN itself. */
export const ASSIGNABLE_BY_ADMIN_TIER: UserRole[] = [
  UserRole.STUDENT,
  UserRole.TEACHER,
  UserRole.PARENT,
  UserRole.NON_ACADEMIC_STAFF,
];
