"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

import { authClient } from "@/lib/auth-client"; //import the auth client
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authcontext";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [role, setRole] = useState("Select Role");
  const [formData, setData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  useEffect(() => {
    setData((prev) => ({
      ...prev,
      role: role,
    }));
  }, [role]);

  // Redirect If user already logged in
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      toast.success("Aleady Logged In Redirecting...");
      router.replace("/dashboard");
    }
  }, [user]);

  const [loading, setLoading] = useState(false);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const githubSignIn = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const data = await authClient.signIn.social({
      provider: "github",
      callbackURL: "/dashboard"
    });
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    // TODO: Add Submission Logic

    event.preventDefault(); // prevents page reload
    setLoading(true);

    if (role == "Select Role") {
      toast.error("Please select a role");
      setLoading(false);
      return;
    }

    const { data, error } = await authClient.signUp.email(
      {
        email: formData.email, // user email address
        password: formData.password, // user password -> min 8 characters by default
        name: formData.name, // user display name
        role: formData.role.toUpperCase(), // User role
        isOnboarded: true,
        callbackURL: "/dashboard", // A URL to redirect to after the user verifies their email (optional)
      } as any,
      {
        onRequest: (ctx) => {
          setLoading(true);
          toast.loading("Signing Up");
        },
        onSuccess: (ctx) => {
          setLoading(false);
          toast.dismiss();
          toast.success("Signed Up Successfully");
          toast.success("Check your Email for Verification.");
        },
        onError: (ctx) => {
          setLoading(false);
          toast.dismiss();
          toast.error("Couldn't Log In");
          toast.error(ctx.error.message);
        },
      }
    );
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">SignUp on CodeColiseum</CardTitle>
          <CardDescription>SignIn with your Github account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full cursor-pointer" onClick={githubSignIn}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                      fill="currentColor"
                    />
                  </svg>
                  Signup with GitHub
                </Button>
              </div>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-3 w-[40%]">
                  <Label>Role</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className={
                          role === "Select Role" ? "text-white/60" : ""
                        }
                      >
                        {role.charAt(0).toUpperCase() +
                          role.slice(1).toLowerCase()}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[45%]">
                      <DropdownMenuLabel>Your Role</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup
                        value={role}
                        onValueChange={setRole}
                      >
                        <DropdownMenuRadioItem value="TEACHER">
                          Teacher
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="STUDENT">
                          Student
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="name"
                    name="name"
                    placeholder="Enter Name"
                    onChange={onChange}
                    required
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    name="email"
                    onChange={onChange}
                    required
                  />
                </div>

                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••••"
                    name="password"
                    onChange={onChange}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className={loading ? "bg-white/30" : ""}
                  disabled={loading}
                >
                  {loading ? "Loading" : "SignUp"}
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-4 after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-card text-muted-foreground relative z-10 px-2">
              Already have an account ?{" "}
              <a href="/login" className="underline underline-offset-4">
                Login
              </a>
            </span>
          </div>
        </CardContent>
      </Card>
      {/* <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div> */}
    </div>
  );
}
