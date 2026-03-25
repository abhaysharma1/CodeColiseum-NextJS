"use client";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/protectedroute";
import { useAuth } from "@/context/authcontext";
import { cn } from "@/lib/utils";
import {
  IconCode,
  IconFileCode,
  IconSparkles,
  IconUserPlus,
} from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";

const navigation = [
  {
    name: "Upload Problems",
    href: "/admin/dashboard",
    icon: IconCode,
  },
  {
    name: "Upload Driver Code",
    href: "/admin/upload-driver-code",
    icon: IconFileCode,
  },
  {
    name: "Complexity Generator",
    href: "/admin/upload-complexity-generator",
    icon: IconSparkles,
  },
  {
    name: "Bulk Sign Up",
    href: "/admin/bulk-sign-up",
    icon: IconSparkles,
  },
  {
    name: "Single Sign Up",
    href: "/admin/single-sign-up",
    icon: IconUserPlus,
  },
];

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const path = usePathname();

  const { logout } = useAuth();

  const changePage = (href: string) => {
    router.push(href);
  };

  return (
    <ProtectedRoute requiredPermission="group:delete">
      <div className="flex min-h-screen bg-background text-foreground">
        <aside className="flex h-screen w-60 flex-col border-r bg-card/60 px-4 py-4">
          <div className="mb-6 flex flex-col gap-1">
            <span className=" font-logoFont  ">CodeColiseum</span>
            <span className="text-sm font-semibold">Admin</span>
          </div>

          <div className="flex flex-col justify-between h-full cursor-pointer">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = path === item.href;

                return (
                  <Button
                    key={item.name}
                    type="button"
                    onClick={() => changePage(item.href)}
                    variant="ghost"
                    className={cn(
                      "flex w-full justify-start gap-2 px-2 py-2 text-sm font-normal",
                      isActive && "bg-muted text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span>{item.name}</span>
                  </Button>
                );
              })}
            </nav>
            <Button variant={"default"} onClick={logout}>
              Logout
            </Button>
          </div>
        </aside>

        <main className="flex-1 min-h-screen bg-background">
          <div className="h-full px-6 py-6 md:px-8 lg:px-10">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
