"use client";

import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { useAuth } from "@/context/authcontext";

export default function Dashboard() {
  const { user, loading } = useAuth();

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
