"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/authcontext";
import { getBackendURL } from "@/utils/utilities";

export type RbacSnapshot = {
  userId: string;
  globalRoleId: string | null;
  globalPermissions: string[];
  groupPermissions: Record<string, string[]>;
};

export type RbacContextValue = {
  loading: boolean;
  error: Error | null;
  snapshot: RbacSnapshot | null;
  hasPermission: (permission: string, groupId?: string) => boolean;
  hasAnyPermission: (permissions: string[], groupId?: string) => boolean;
};

const RbacContext = createContext<RbacContextValue | undefined>(undefined);

function normalizePermission(permission: string): string {
  return permission.trim().toLowerCase();
}

function buildPermissionIndex(snapshot: RbacSnapshot | null) {
  const global = new Set<string>();
  const groups = new Map<string, Set<string>>();

  if (!snapshot) return { global, groups };

  for (const key of snapshot.globalPermissions || []) {
    global.add(normalizePermission(key));
  }

  for (const [groupId, perms] of Object.entries(
    snapshot.groupPermissions || {}
  )) {
    const set = new Set<string>();
    for (const key of perms || []) {
      set.add(normalizePermission(key));
    }
    groups.set(groupId, set);
  }

  return { global, groups };
}

export function RbacProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<{
    snapshot: RbacSnapshot | null;
    loading: boolean;
    error: Error | null;
  }>({ snapshot: null, loading: false, error: null });

  useEffect(() => {
    let cancelled = false;

    if (!user?.id) {
      setState({ snapshot: null, loading: false, error: null });
      return;
    }

    const run = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const res = await axios.get<RbacSnapshot>(
          `${getBackendURL()}/permissions/me`,
          {
            withCredentials: true,
          }
        );
        if (!cancelled) {
          setState({ snapshot: res.data, loading: false, error: null });
        }
      } catch (err: any) {
        if (!cancelled) {
          setState({
            snapshot: null,
            loading: false,
            error:
              err instanceof Error
                ? err
                : new Error("Failed to load permissions"),
          });
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const { global, groups } = useMemo(
    () => buildPermissionIndex(state.snapshot),
    [state.snapshot]
  );

  const hasPermission = (permission: string, groupId?: string): boolean => {
    const key = normalizePermission(permission);

    if (global.has(key)) return true;

    if (groupId) {
      const set = groups.get(groupId);
      if (set && set.has(key)) return true;
    }

    return false;
  };

  const hasAnyPermission = (permissions: string[], groupId?: string): boolean =>
    permissions.some((perm) => hasPermission(perm, groupId));

  return (
    <RbacContext.Provider
      value={{
        loading: state.loading,
        error: state.error,
        snapshot: state.snapshot,
        hasPermission,
        hasAnyPermission,
      }}
    >
      {children}
    </RbacContext.Provider>
  );
}

export function useRbac() {
  const ctx = useContext(RbacContext);
  if (!ctx) {
    throw new Error("useRbac must be used within RbacProvider");
  }
  return ctx;
}
