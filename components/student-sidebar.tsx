"use client";

import * as React from "react";
import { IconInnerShadowTop } from "@tabler/icons-react";
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
              <a href="/">
                <span className="font-logoFont text-xl ">CODECOLISEUM</span>
              </a>
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
