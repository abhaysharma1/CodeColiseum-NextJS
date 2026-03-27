"use client";
import { useAuth } from "@/context/authcontext";
import { usePermissionWithLoading } from "@/hooks/usePermission";
import { ReactNode, useEffect } from "react";
import { Spinner } from "./ui/shadcn-io/spinner";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string;
  groupId?: string;
}

export const ProtectedRoute = ({
  children,
  requiredPermission,
  groupId,
}: ProtectedRouteProps) => {
  const { user, loading: authLoading, error } = useAuth();
  const { allowed: hasRequiredPermission, loading: permissionLoading } =
    usePermissionWithLoading(requiredPermission ?? "group:view", groupId);
  const router = useRouter();

  useEffect(() => {
    // redirect if not logged in
    if (!user?.id && !authLoading) {
      router.replace("/login");
    }

    if (
      user?.id &&
      requiredPermission &&
      !hasRequiredPermission &&
      !authLoading &&
      !permissionLoading
    ) {
      router.replace("/dashboard");
    }
  }, [
    user,
    authLoading,
    requiredPermission,
    hasRequiredPermission,
    permissionLoading,
    router,
  ]);

  if (authLoading || permissionLoading) {
    return (
      <div className=" w-[100vw] h-[100vh] bg-background flex justify-center items-center">
        <Spinner variant="ring" size={50} />
      </div>
    );
  }

  if (!user && !authLoading) {
    return (
      <div className="w-screen h-screen bg-background flex justify-center items-center text-2xl">
        <div>
          Not Logged in
          {error?.message}
        </div>
      </div>
    );
  }

  if (user && requiredPermission && !hasRequiredPermission) {
    return (
      <div className="w-screen h-screen bg-background flex justify-center items-center text-2xl">
        <div>Not authorized</div>
      </div>
    );
  }

  if (user && !error) {
    return children;
  }
};
