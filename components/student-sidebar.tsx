"use client";

import * as React from "react";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavStudentMain } from "@/components/nav-student-main";
import { NotificationBell } from "@/components/NotificationBell";

interface StudentSidebarProps {
  user: any;
  variant: "sidebar" | "floating" | "inset" | undefined;
  page: string;
  props?: React.ComponentProps<typeof Sidebar>;
}

export function StudentSidebar({
  user,
  variant,
  page,
  ...props
}: StudentSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" variant={variant}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <div className="flex w-full items-center justify-between gap-2">
                <a href="/" className="flex items-center gap-2">
                  <span className="font-logoFont text-xl ">CODECOLISEUM</span>
                </a>
                <NotificationBell />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavStudentMain page={page} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
