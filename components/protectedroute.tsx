"use client";
import { useAuth } from "@/context/authcontext";
import { usePermission } from "@/hooks/usePermission";
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
  const { user, loading, error } = useAuth();
  const hasRequiredPermission = usePermission(
    requiredPermission ?? "group:view",
    groupId
  );
  const router = useRouter();

  useEffect(() => {
    // redirect if not logged in
    if (!user?.id && !loading) {
      router.replace("/login");
    }

    if (user?.id && requiredPermission && !hasRequiredPermission && !loading) {
      router.replace("/dashboard");
    }
  }, [user, loading, requiredPermission, hasRequiredPermission, router]);

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

  if (user && !error) {
    return children;
  }
};
