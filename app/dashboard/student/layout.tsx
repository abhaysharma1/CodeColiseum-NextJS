"use client";
import { useAuth } from "@/context/authcontext";
import { ProtectedRoute } from "@/components/protectedroute";
import React, { useEffect, useState } from "react";
import { StudentSidebar } from "@/components/student-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const path = usePathname();
  const [page, setPage] = useState("");

  useEffect(() => {
    if (path === "/dashboard/student") {
      setPage("DASHBOARD");
    } else if (path.startsWith("/dashboard/student/problem-list")) {
      setPage("PROBLEMS");
    } else if (path.startsWith("/dashboard/student/contests")) {
      setPage("CONTESTS");
    } else if (path.startsWith("/dashboard/student/progress")) {
      setPage("PROGRESS");
    } else if (path.startsWith("/dashboard/student/classes")) {
      setPage("CLASSES");
    } else if (path.startsWith("/dashboard/student/labs")) {
      setPage("LABS");
    } else {
      setPage("DASHBOARD");
    }
  }, [path]);

  return (
    <ProtectedRoute requiredRole="STUDENT" requiredPermission="group:view">
      <SidebarProvider>
        <StudentSidebar user={user} variant="inset" page={page} />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
