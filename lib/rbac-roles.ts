export const RBAC_ROLE_IDS = {
  ORG_STUDENT: "role_org_student",
  ORG_TEACHER: "role_org_teacher",
  PLATFORM_ADMIN: "role_platform_admin",
} as const;

export type RbacRoleId = (typeof RBAC_ROLE_IDS)[keyof typeof RBAC_ROLE_IDS];

export const RBAC_ROLE_OPTIONS: Array<{ value: RbacRoleId; label: string }> = [
  { value: RBAC_ROLE_IDS.ORG_STUDENT, label: "Student" },
  { value: RBAC_ROLE_IDS.ORG_TEACHER, label: "Teacher" },
  { value: RBAC_ROLE_IDS.PLATFORM_ADMIN, label: "Admin" },
];
