"use client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ProtectedRoute } from "@/components/protectedroute";
import { ReactNode } from "react";

export default function DashBoardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        {children}
      </SidebarProvider>
    </ProtectedRoute>
  );
}
