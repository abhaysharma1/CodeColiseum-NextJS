"use client";

import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { useAuth } from "@/context/authcontext";
import { RBAC_ROLE_IDS } from "@/lib/rbac-roles";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || !user?.id) {
      return;
    }

    if (user.globalRoleId === RBAC_ROLE_IDS.PLATFORM_ADMIN) {
      router.replace("/admin/dashboard");
      return;
    }

    if (user.globalRoleId === RBAC_ROLE_IDS.ORG_TEACHER) {
      router.replace("/dashboard/teacher");
      return;
    }

    if (user.globalRoleId === RBAC_ROLE_IDS.ORG_STUDENT) {
      router.replace("/dashboard/student");
    }
  }, [loading, user?.id, user?.globalRoleId, router]);

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
