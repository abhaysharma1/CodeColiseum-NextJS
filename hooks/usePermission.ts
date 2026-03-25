"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/authcontext";
import { getBackendURL } from "@/utils/utilities";

const ROLE_FALLBACK_PERMISSIONS = {
  ADMIN: new Set<string>([
    "group:view",
    "group:edit",
    "group:delete",
    "exam:create",
    "exam:edit",
    "exam:publish",
    "submission:view",
    "submission:grade",
    "analytics:view",
  ]),
  TEACHER: new Set<string>([
    "group:view",
    "group:edit",
    "group:delete",
    "exam:create",
    "exam:edit",
    "exam:publish",
    "submission:view",
    "submission:grade",
    "analytics:view",
  ]),
  STUDENT: new Set<string>(["group:view", "submission:view"]),
} as const;

function normalizePermission(permission: string): string {
  return permission.trim().toLowerCase();
}

const CACHE_TTL_MS = 30 * 1000;

type PermissionCacheEntry = {
  value: boolean;
  expiresAt: number;
};

const permissionCache = new Map<string, PermissionCacheEntry>();

function getCacheKey(permission: string, groupId?: string): string {
  return [normalizePermission(permission), groupId ?? "global"].join(":");
}

function getFallbackPermission(role: unknown, permission: string): boolean {
  const roleKey = String(
    role ?? ""
  ).toUpperCase() as keyof typeof ROLE_FALLBACK_PERMISSIONS;
  const permissionSet = ROLE_FALLBACK_PERMISSIONS[roleKey];

  if (!permissionSet) {
    return false;
  }

  return permissionSet.has(normalizePermission(permission));
}

export function usePermission(permission: string, groupId?: string): boolean {
  const { user } = useAuth();

  const fallbackValue = useMemo(() => {
    if (!user?.role) {
      return false;
    }

    return getFallbackPermission(user.role, permission);
  }, [permission, user?.role]);

  const [allowed, setAllowed] = useState<boolean>(fallbackValue);

  useEffect(() => {
    let cancelled = false;

    if (!user?.id) {
      setAllowed(false);
      return () => {
        cancelled = true;
      };
    }

    const cacheKey = getCacheKey(permission, groupId);
    const cached = permissionCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      setAllowed(cached.value);
      return () => {
        cancelled = true;
      };
    }

    const run = async () => {
      try {
        const response = await axios.get(
          `${getBackendURL()}/permissions/check`,
          {
            params: { permission, groupId },
            withCredentials: true,
          }
        );

        const value = Boolean(
          (response.data as { allowed?: boolean })?.allowed
        );

        permissionCache.set(cacheKey, {
          value,
          expiresAt: Date.now() + CACHE_TTL_MS,
        });

        if (!cancelled) {
          setAllowed(value);
        }
      } catch {
        if (!cancelled) {
          setAllowed(fallbackValue);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [fallbackValue, groupId, permission, user?.id]);

  return allowed;
}

export function useHasAnyPermission(
  permissions: string[],
  groupId?: string
): boolean {
  const { user } = useAuth();

  const fallbackValue = useMemo(() => {
    if (!user?.role) {
      return false;
    }

    return permissions.some((permission) =>
      getFallbackPermission(user.role, permission)
    );
  }, [permissions, user?.role]);

  const [allowed, setAllowed] = useState<boolean>(fallbackValue);

  useEffect(() => {
    let cancelled = false;

    if (!user?.id || permissions.length === 0) {
      setAllowed(false);
      return () => {
        cancelled = true;
      };
    }

    const run = async () => {
      try {
        for (const permission of permissions) {
          const cacheKey = getCacheKey(permission, groupId);
          const cached = permissionCache.get(cacheKey);

          if (cached && cached.expiresAt > Date.now() && cached.value) {
            if (!cancelled) {
              setAllowed(true);
            }
            return;
          }

          const response = await axios.get(
            `${getBackendURL()}/permissions/check`,
            {
              params: { permission, groupId },
              withCredentials: true,
            }
          );

          const value = Boolean(
            (response.data as { allowed?: boolean })?.allowed
          );

          permissionCache.set(cacheKey, {
            value,
            expiresAt: Date.now() + CACHE_TTL_MS,
          });

          if (value) {
            if (!cancelled) {
              setAllowed(true);
            }
            return;
          }
        }

        if (!cancelled) {
          setAllowed(false);
        }
      } catch {
        if (!cancelled) {
          setAllowed(fallbackValue);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [fallbackValue, groupId, permissions, user?.id]);

  return allowed;
}
