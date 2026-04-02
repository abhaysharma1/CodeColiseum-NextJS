"use client";

import { useAuth } from "@/context/authcontext";
import { useRbac } from "@/context/rbacContext";

type PermissionState = {
  allowed: boolean;
  loading: boolean;
};

function usePermissionState(
  permission: string,
  groupId?: string
): PermissionState {
  const { user } = useAuth();
  const { loading, hasPermission } = useRbac();

  if (!user?.id) {
    return { allowed: false, loading: false };
  }

  return {
    allowed: hasPermission(permission, groupId),
    loading,
  };
}

export function usePermission(permission: string, groupId?: string): boolean {
  return usePermissionState(permission, groupId).allowed;
}

export function usePermissionWithLoading(
  permission: string,
  groupId?: string
): PermissionState {
  return usePermissionState(permission, groupId);
}

export function useHasAnyPermission(
  permissions: string[],
  groupId?: string
): boolean {
  const { user } = useAuth();
  const { hasAnyPermission } = useRbac();

  if (!user?.id || permissions.length === 0) {
    return false;
  }

  return hasAnyPermission(permissions, groupId);
}
