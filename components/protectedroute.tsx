"use client";
import { useAuth } from "@/context/authcontext";
import { usePermission } from "@/hooks/usePermission";
import { ReactNode, useEffect } from "react";
import { Spinner } from "./ui/shadcn-io/spinner";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string;
  groupId?: string;
  requiredRole?: "ADMIN" | "TEACHER" | "STUDENT";
}

export const ProtectedRoute = ({
  children,
  requiredPermission,
  groupId,
  requiredRole,
}: ProtectedRouteProps) => {
  const { user, loading, error } = useAuth();
  const hasRequiredPermission = usePermission(
    requiredPermission ?? "group:view",
    groupId
  );
  const router = useRouter();

  useEffect(() => {
    // redirect if not logged in
    if (!user?.id && !loading) {
      toast.error("Not Logged In Redirecting To Login Page...");
      router.replace("/login");
    }

    if (user?.id && requiredPermission && !hasRequiredPermission && !loading) {
      toast.error("You do not have access to this page");
      router.replace("/dashboard");
    }

    if (user?.id && requiredRole && user.role !== requiredRole && !loading) {
      toast.error("You do not have access to this page");
      router.replace("/dashboard");
    }
  }, [
    user,
    loading,
    requiredPermission,
    hasRequiredPermission,
    requiredRole,
    router,
  ]);

  if (!user && !loading) {
    return (
      <div className="w-screen h-screen bg-background flex justify-center items-center text-2xl">
        <div>
          Not Logged in
          {error?.message}
        </div>
      </div>
    );
  }

  if (!user && loading) {
    return (
      <div className=" w-[100vw] h-[100vh] bg-background flex justify-center items-center">
        <Spinner variant="ring" size={50} />
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

  if (user && requiredRole && user.role !== requiredRole) {
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
