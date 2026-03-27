"use client";
import { useAuth } from "@/context/authcontext";
import { ProtectedRoute } from "@/components/protectedroute";
import React, { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const path = usePathname();
  const [page, setPage] = useState("");

  useEffect(() => {
    if (path == "/dashboard/teacher") {
      setPage("DASHBOARD");
    } else if (path.startsWith("/dashboard/teacher/tests")) {
      setPage("TESTS");
    } else if (path.startsWith("/dashboard/teacher/students")) {
      setPage("STUDENTS");
    } else if (path.startsWith("/dashboard/teacher/problems")) {
      setPage("PROBLEMS");
    } else if (path.startsWith("/dashboard/teacher/analytics")) {
      setPage("ANALYTICS");
    } else if (path.startsWith("/dashboard/teacher/announcements")) {
      setPage("ANNOUNCEMENTS");
    } else if (path.startsWith("/dashboard/notifications")) {
      setPage("NOTIFICATIONS");
    }
  }, [path]);

  return (
    <ProtectedRoute requiredPermission="group:view">
      <SidebarProvider>
        <AppSidebar user={user} variant="inset" page={page} />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
