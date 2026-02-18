import ProblemsTable from "@/app/problemlist/problemsTable";
import { SiteHeader } from "@/components/site-header";
import React from "react";

function Problems() {
  return (
    <div className="h-full w-full flex flex-col">
      <div className="w-full">
        <SiteHeader name="Problems" />
      </div>

      <div className="flex-1 h-full w-full rounded-b-lg p-7">
        <div className="">
          <ProblemsTable />
        </div>
      </div>
    </div>
  );
}

export default Problems;
