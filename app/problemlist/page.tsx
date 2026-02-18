import React from "react";
import ProblemsTable from "./problemsTable";
import { Navbar01 } from "@/components/ui/shadcn-io/navbar";

function page() {
  return (
    <div className="min-h-screen w-full bg-background">
      <Navbar01 />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Problem Set</h1>
            <p className="text-muted-foreground">
              Practice coding problems to sharpen your skills
            </p>
          </div>
          <ProblemsTable />
        </div>
      </div>
    </div>
  );
}

export default page;
