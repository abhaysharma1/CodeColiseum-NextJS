"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { MdLibraryBooks, MdOutlineSpaceDashboard } from "react-icons/md";
import { PiStudentBold } from "react-icons/pi";

export function NavMain({ page }: { page: string }) {
  const router = useRouter();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem
            className={
              page == "DASHBOARD"
                ? "bg-primary text-primary-foreground rounded-md"
                : ""
            }
            onClick={() => router.push("/dashboard/teacher")}>
            <SidebarMenuButton tooltip={"Dashboard"}>
              <MdOutlineSpaceDashboard />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem
            className={
              page == "STUDENTS"
                ? "bg-primary text-primary-foreground rounded-md"
                : ""
            }
            onClick={() => router.push("/dashboard/teacher/students")}>
            <SidebarMenuButton tooltip={"Students"}>
              <PiStudentBold />
              <span>Students</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem
            className={
              page == "PROBLEMS"
                ? "bg-primary text-primary-foreground rounded-md"
                : ""
            }
            onClick={() => router.push("/dashboard/teacher/problems")}>
            <SidebarMenuButton tooltip={"Problems"}>
              <MdLibraryBooks />
              <span>Problems</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
