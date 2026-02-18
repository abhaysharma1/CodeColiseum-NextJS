"use client";
import React, { useEffect, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/context/authcontext";
import axios from "axios";
import { useRouter } from "next/navigation";

function Onboarding() {
  const [selectedRole, setSelectedRole] = useState("Select Role");
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      toast.error("User is not logged in");
      router.replace("/login");
    }
    if (user?.isOnboarded) {
      toast.error("Already Onboarded");
      router.replace("/dashboard");
    }
  }, [user]);

  const onSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (selectedRole == "Select Role") {
      toast.error("Please Select a Role");
      return;
    }
    try {
      const response = await axios.post("/api/onboarding", {
        id: user?.id,
        role: selectedRole,
      });
      if (response.status == 201) {
        toast.success("Successfully Selected Role");

        logout();
        router.push("/login");
      }
    } catch (error) {
      if (typeof error == "string") {
        toast.error(error);
      } else {
        toast.error("Couln't select role");
      }
    }
  };

  return (
    <div className="w-screen h-screen bg-[#0a0a0ae2] absolute z-11">
      <div className="w-full h-full flex justify-center items-center">
        <div className="bg-background w-[25vw] h-[30vh] rounded-md outline-1 outline-white/20 outline-offset-5 ">
          <div className="px-10 py-6">
            <div className="">
              <div className="text-xl font-semibold ">
                <div>Select Role</div>
              </div>
              <div className="text-foreground text-xs mt-1.5 ">
                <div>Please select your role from the following</div>
              </div>
            </div>
            <div className="mt-5">
              <div className="grid gap-3 w-[40%]">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className={
                        selectedRole === "Select Role" ? "text-white/60" : ""
                      }
                    >
                      {selectedRole.charAt(0).toUpperCase() +
                        selectedRole.slice(1).toLowerCase()}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[60%]">
                    <DropdownMenuLabel>Your Role</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                      value={selectedRole}
                      onValueChange={setSelectedRole}
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
            </div>
            <div className="flex justify-end w-full mt-5">
              <Button onClick={onSubmit}>Submit</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
