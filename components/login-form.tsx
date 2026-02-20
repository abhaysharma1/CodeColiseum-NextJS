import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authcontext";

interface props {
  className?: string | null;
  setShowVerifyBox: Dispatch<SetStateAction<boolean>>;
  props?: React.ComponentProps<"form">;
}

export function LoginForm({ className, setShowVerifyBox, ...props }: props) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      toast.success("Aleady Logged In Redirecting...");
      router.replace("/dashboard");
    }
  }, [user]);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);

    toast.loading("Logging You In...");

    const { data, error } = await authClient.signIn.email(
      {
        email: formData.email,
        password: formData.password,

        callbackURL: "/dashboard",
        rememberMe: true,
      },
      {
        onError: (ctx) => {
          if (ctx.error.status === 403) {
            toast.error("Please verify your email address");
          }
          toast.error(ctx.error.message);
          return;
        },
      }
    );

    toast.dismiss();

    if (data?.token) {
      setLoading(false);
      toast.success("Logged In Successfully Redirecting...");
    }

    if (error) {
      setLoading(false);
      console.log(error);
      toast.error("Couldn't log In");
      toast.error(error.message);
    }
  };



  const verifybox = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setShowVerifyBox(true);
  };

  return (
    <form
      className={cn("flex flex-col gap-6 ", className)}
      {...props}
      onSubmit={onSubmit}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to CodeColiseum</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            name="email"
            onChange={onChange}
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            {/* <a
                href="#"
                className="ml-auto text-sm underline-offset-4 hover:underline"
              >
                Forgot your password?
              </a> */}
          </div>
          <Input
            id="password"
            type="password"
            name="password"
            onChange={onChange}
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
      </div>
      <div>
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="underline underline-offset-4">
            Sign up
          </a>
        </div>
        <div className="text-center text-sm flex justify-center gap-1 mt-4">
          <button
            className="cursor-pointer underline underline-offset-4"
            onClick={verifybox}
          >
            Verify
          </button>
          <h1>Your Email</h1>
        </div>
      </div>
    </form>
  );
}
