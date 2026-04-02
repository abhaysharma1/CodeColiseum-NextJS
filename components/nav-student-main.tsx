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
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { IoCodeSlashOutline } from "react-icons/io5";
import { IoMdPeople } from "react-icons/io";
import { TestTubeDiagonal, Bell } from "lucide-react";

export function NavStudentMain({ page }: { page: string }) {
  const router = useRouter();
  const canViewGroup = usePermission("group:view");
  const canViewSubmission = usePermission("submission:view");

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {canViewGroup && (
            <SidebarMenuItem
              className={
                page == "DASHBOARD"
                  ? "bg-primary text-primary-foreground rounded-md"
                  : ""
              }
              onClick={() => router.replace("/dashboard/student")}
            >
              <SidebarMenuButton tooltip={"Dashboard"}>
                <MdOutlineSpaceDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {canViewGroup && (
            <SidebarMenuItem
              className={
                page == "CLASSES"
                  ? "bg-primary text-primary-foreground rounded-md"
                  : ""
              }
              onClick={() => router.push("/dashboard/student/classes")}
            >
              <SidebarMenuButton tooltip={"Classes"}>
                <IoMdPeople />
                <span>Classes</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {canViewGroup && (
            <SidebarMenuItem
              className={
                page == "LABS"
                  ? "bg-primary text-primary-foreground rounded-md"
                  : ""
              }
              onClick={() => router.push("/dashboard/student/labs")}
            >
              <SidebarMenuButton tooltip={"Labs"}>
                <TestTubeDiagonal />
                <span>Labs</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {canViewSubmission && (
            <SidebarMenuItem
              className={
                page == "PROBLEMS"
                  ? "bg-primary text-primary-foreground rounded-md"
                  : ""
              }
              onClick={() => router.push("/dashboard/student/problem-list")}
            >
              <SidebarMenuButton tooltip={"Problems"}>
                <IoCodeSlashOutline />
                <span>Problems</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem
            className={
              page == "NOTIFICATIONS"
                ? "bg-primary text-primary-foreground rounded-md"
                : ""
            }
            onClick={() => router.push("/dashboard/student/notifications")}
          >
            <SidebarMenuButton tooltip={"Notifications"}>
              <Bell />
              <span>Notifications</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
