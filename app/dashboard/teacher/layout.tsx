"use client";
import { useAuth } from "@/context/authcontext";
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
    } else if (path.startsWith("/dashboard/teacher/students")) {
      setPage("STUDENTS");
    } else if (path.startsWith("/dashboard/teacher/problems")) {
      setPage("PROBLEMS");
    }
  }, [path]);

  return (
    <SidebarProvider>
      <AppSidebar user={user} variant="inset" page={page} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
