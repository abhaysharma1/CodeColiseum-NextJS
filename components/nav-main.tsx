"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePermission } from "@/hooks/usePermission";
import { useRouter } from "next/navigation";
import { MdLibraryBooks, MdOutlineSpaceDashboard } from "react-icons/md";
import { PiStudentBold } from "react-icons/pi";

export function NavMain({ page }: { page: string }) {
  const router = useRouter();
  const canViewGroups = usePermission("group:view");
  const canEditGroup = usePermission("group:edit");
  const canEditExam = usePermission("exam:edit");

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {canViewGroups && (
            <SidebarMenuItem
              className={
                page == "DASHBOARD"
                  ? "bg-primary text-primary-foreground rounded-md"
                  : ""
              }
              onClick={() => router.push("/dashboard/teacher")}
            >
              <SidebarMenuButton tooltip={"Dashboard"}>
                <MdOutlineSpaceDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {canEditGroup && (
            <SidebarMenuItem
              className={
                page == "STUDENTS"
                  ? "bg-primary text-primary-foreground rounded-md"
                  : ""
              }
              onClick={() => router.push("/dashboard/teacher/students")}
            >
              <SidebarMenuButton tooltip={"Students"}>
                <PiStudentBold />
                <span>Students</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {canEditExam && (
            <SidebarMenuItem
              className={
                page == "PROBLEMS"
                  ? "bg-primary text-primary-foreground rounded-md"
                  : ""
              }
              onClick={() => router.push("/dashboard/teacher/problems")}
            >
              <SidebarMenuButton tooltip={"Problems"}>
                <MdLibraryBooks />
                <span>Problems</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
