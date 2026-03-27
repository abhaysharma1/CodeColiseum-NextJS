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
import { IoAnalytics } from "react-icons/io5";
import { BookOpen, Megaphone } from "lucide-react";

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
          {canEditExam && (
            <SidebarMenuItem
              className={
                page == "TESTS"
                  ? "bg-primary text-primary-foreground rounded-md"
                  : ""
              }
              onClick={() => router.push("/dashboard/teacher/tests")}
            >
              <SidebarMenuButton tooltip={"Tests & Exams"}>
                <BookOpen />
                <span>Tests & Exams</span>
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
          {canViewGroups && (
            <SidebarMenuItem
              className={
                page == "ANALYTICS"
                  ? "bg-primary text-primary-foreground rounded-md"
                  : ""
              }
              onClick={() => router.push("/dashboard/teacher/analytics")}
            >
              <SidebarMenuButton tooltip={"Analytics"}>
                <IoAnalytics />
                <span>Analytics</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {canViewGroups && (
            <SidebarMenuItem
              className={
                page == "ANNOUNCEMENTS"
                  ? "bg-primary text-primary-foreground rounded-md"
                  : ""
              }
              onClick={() => router.push("/dashboard/teacher/announcements")}
            >
              <SidebarMenuButton tooltip={"Announcements"}>
                <Megaphone />
                <span>Announcements</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
