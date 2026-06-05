"use client";

import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { useAuth } from "@/context/authcontext";
import { useEffect } from "react";

const ROLE_DESTINATIONS: Record<string, string> = {
  role_platform_admin: "/admin/dashboard",
  role_org_teacher: "/dashboard/teacher",
  role_org_student: "/dashboard/student",
};

export default function Dashboard() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!user?.globalRoleId || loading) return;

    const dest = ROLE_DESTINATIONS[user.globalRoleId];
    if (dest) {
      window.location.href = dest;
    }
  }, [user, loading]);

  if (loading || !user?.id) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <div>
          <Spinner variant="ring" />
        </div>
      </div>
    );
  }

  if (!user.globalRoleId) {
    return (
      <div className="flex items-center justify-center h-screen w-screen text-center px-4">
        <div>
          <p className="text-lg font-semibold">Role not assigned</p>
          <p className="text-sm text-muted-foreground">
            Your account does not have a global role. Please contact an
            administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen w-screen">
      <div>
        <Spinner variant="ring" />
      </div>
    </div>
  );
}
