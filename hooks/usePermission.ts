"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/authcontext";
import { getBackendURL } from "@/utils/utilities";

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

export function usePermission(permission: string, groupId?: string): boolean {
  const { user } = useAuth();

  const [allowed, setAllowed] = useState<boolean>(false);

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
          setAllowed(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [groupId, permission, user?.id]);

  return allowed;
}

export function useHasAnyPermission(
  permissions: string[],
  groupId?: string
): boolean {
  const { user } = useAuth();

  const [allowed, setAllowed] = useState<boolean>(false);

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
          setAllowed(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [groupId, permissions, user?.id]);

  return allowed;
}
