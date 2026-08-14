"use client"
import { SignupForm } from "@/components/signup-form";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function signup() {
  const router = useRouter();

  useEffect(()=>{
    router.push("/login");
  },[])
  
  return (
    <div className="h-screen bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      Not Allowed
    </div>
  );
}
