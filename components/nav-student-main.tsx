"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { IoCodeSlashOutline } from "react-icons/io5";
import { IoMdPeople } from "react-icons/io";

export function NavStudentMain({ page }: { page: string }) {
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
            onClick={() => router.replace("/dashboard/student")}
          >
            <SidebarMenuButton tooltip={"Dashboard"}>
              <MdOutlineSpaceDashboard />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem
            className={
              page == "GROUPS"
                ? "bg-primary text-primary-foreground rounded-md"
                : ""
            }
            onClick={() => router.push("/dashboard/student/groups")}
          >
            <SidebarMenuButton tooltip={"Groups"}>
              <IoMdPeople />
              <span>Groups</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem
            className={
              page == "PROBLEMS"
                ? "bg-primary text-primary-foreground rounded-md"
                : ""
            }
            onClick={() => router.push("/dashboard/student/problemlist")}
          >
            <SidebarMenuButton tooltip={"Problems"}>
              <IoCodeSlashOutline />
              <span>Problems</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
