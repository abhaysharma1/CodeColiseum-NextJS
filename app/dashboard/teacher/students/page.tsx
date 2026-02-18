
import { SiteHeader } from "@/components/site-header";
import CreatedGroups from "@/app/dashboard/teacher/students/createdGroups";

function Students() {
  return (
    <div className="animate-fade-left animate-once h-full w-full flex flex-col">
      <div className="w-full">
        <SiteHeader name={"Manage Students"} />
      </div>
      <div className="flex-1 p-4 px-6">
        <div className="@container/main flex flex-1 gap-2 ">
          {/* <Separator className="mt-4" /> */}

          <div>
            <CreatedGroups />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Students;
