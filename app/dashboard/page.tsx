import { Spinner } from "@/components/ui/shadcn-io/spinner";

export default function Dashboard() {
  // Middleware handles the redirect based on role
  // This page only shows briefly during the redirect
  return (
    <div className="flex items-center justify-center h-screen w-screen">
      <div><Spinner variant="ring" /></div>
    </div>
  );
}
