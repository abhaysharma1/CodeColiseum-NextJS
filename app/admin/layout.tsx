"use client";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/protectedroute";
import { useAuth } from "@/context/authcontext";
import { cn } from "@/lib/utils";
import {
  IconCode,
  IconFileCode,
  IconSparkles,
  IconUsersPlus,
  IconUserPlus,
} from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";
import { useTheme } from "next-themes";
import { useCustomTheme } from "@/hooks/use-custom-theme";
import { ThemeName, THEMES } from "@/themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { MdDarkMode } from "react-icons/md";
import { FaSun } from "react-icons/fa";
import { Palette } from "lucide-react";

const navigation = [
  {
    name: "Upload Problems",
    href: "/admin/dashboard",
    icon: IconCode,
  },
  {
    name: "Create Problem (Beta)",
    href: "/admin/problem-editor",
    icon: IconFileCode,
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
    icon: IconUsersPlus,
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
  const { theme, setTheme } = useTheme();
  const { selected, setThemeName } = useCustomTheme();

  const changeTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const changePage = (href: string) => {
    router.push(href);
  };

  return (
    <ProtectedRoute requiredPermission="group:delete">
      <div className="flex h-screen overflow-hidden bg-background text-foreground">
        <aside className="flex h-full w-60 flex-col overflow-y-auto border-r bg-card/60 px-4 py-4">
          <div className="mb-6 flex flex-col gap-1">
            <span className=" font-logoFont  ">CodeColiseum</span>
            <span className="text-sm font-semibold">Admin</span>
          </div>

          <div className="flex h-full min-h-0 cursor-pointer flex-col justify-between">
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
            <div className="flex flex-col gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between mt-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <div className="flex items-center gap-2">
                      <Palette size={15} />
                      <span>Theme: {String(selected)}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="center" side="top">
                  {Object.entries(THEMES).map(([key]) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => setThemeName(key as ThemeName)}
                    >
                      {key[0].toUpperCase() + key.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div
                onClick={(event) => {
                  event.preventDefault();
                  changeTheme();
                }}
                className="w-full flex items-center justify-between px-2 py-2 cursor-pointer rounded hover:bg-muted"
              >
                <div className="flex items-center text-sm font-medium">
                  {theme === "dark" ? (
                    <MdDarkMode className="mt-0.5 mr-2 size-4" />
                  ) : (
                    <FaSun className="mt-0.5 mr-2 size-4" />
                  )}
                  <span>Toggle Theme</span>
                </div>
                <Switch checked={theme === "light"} />
              </div>

              <Button variant={"default"} onClick={logout} className="mt-2">
                Logout
              </Button>
            </div>
          </div>
        </aside>

        <main className="h-full flex-1 overflow-y-auto bg-background">
          <div className="min-h-full px-6 py-6 md:px-8 lg:px-10">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
