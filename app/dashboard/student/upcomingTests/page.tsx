"use client";
import { SiteHeader } from "@/components/site-header";
import TestsTable from "./upcomingTestsTable";

export default function StudentDashboard() {
  return (
    <>
      <SiteHeader name="Dashboard" />
      <div className="flex flex-1 flex-col px-10 py-6">
        <h1 className="text-xl">Upcoming Tests</h1>
        <TestsTable />
      </div>
    </>
  );
}
