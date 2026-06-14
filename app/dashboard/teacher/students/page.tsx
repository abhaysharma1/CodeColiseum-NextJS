import { SiteHeader } from "@/components/site-header";
import StudentGroupsView from "@/app/dashboard/teacher/students/student-groups-view";

function Page() {
  return (
    <div className="animate-fade-left animate-once h-full w-full flex flex-col">
      <div className="w-full">
        <SiteHeader name={"Student Groups"} />
      </div>
      <div className="flex-1 p-4 px-6">
        <div className="@container/main flex flex-1 gap-2 w-full">
          <div className="w-full">
            <StudentGroupsView />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
