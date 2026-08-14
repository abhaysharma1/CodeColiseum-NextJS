"use client";

import { GalleryVerticalEnd } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { getBackendURL } from "@/utils/utilities";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    toast.loading("Checking Account...");

    try {
      await axios.post(
        `${getBackendURL()}/public-auth/request-password-reset`,
        { email },
        { withCredentials: true },
      );

      toast.dismiss();
      setLoading(false);
      toast.success("Password reset email sent. Check your inbox.");
    } catch (error: any) {
      toast.dismiss();
      setLoading(false);

      if (error?.response?.status === 404) {
        toast.error("No account found with this email address");
        return;
      }

      toast.error(
        error?.response?.data?.message ??
          error?.response?.data?.error ??
          "Couldn't send reset email",
      );
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            CodeColiseum
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <form onSubmit={onSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Forgot your password?</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Enter your email below and we&apos;ll send you a link to reset
                  it
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
              <div className="text-center text-sm">
                Remembered your password?{" "}
                <a href="/login" className="underline underline-offset-4">
                  Back to login
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          fill={true}
          src="/images/Facebook-Movie-Hacking-Scene-Upscaled.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.6] dark:grayscale"
        />
      </div>
    </div>
  );
}
