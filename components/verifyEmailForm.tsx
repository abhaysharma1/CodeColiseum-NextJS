import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RxCross2 } from "react-icons/rx";
import { Button } from "./ui/button";
import React, {
  Dispatch,
  SetStateAction,
  useState,
} from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

function VerifyEmailForm({
  setShowVerifyBox,
}: {
  setShowVerifyBox: Dispatch<SetStateAction<boolean>>;
}) {
  const [email, setEmail] = useState("");
  const [disabled, setDisabled] = useState(false);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setEmail(value);
  };

  const sendMail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) {
      toast.error("Enter a Email to Continue");
      return;
    }
    setDisabled(true);
    toast.loading("Sending Email");
    const response = await authClient.sendVerificationEmail({
      email: email,
      callbackURL: "/login",
    });

    toast.dismiss();
    toast.success("Mail Sent")
    setDisabled(false);
  };

  return (
    <div className="w-screen h-screen bg-[#0a0a0ae2] absolute z-11 animate-fade-up animate-once animate-duration-700">
      <div className="w-full h-full flex justify-center items-center">
        <div className="bg-background w-[25vw] h-[40vh] rounded-md outline-1 outline-white/20 outline-offset-5 ">
          <div className="flex w-full justify-end p-3 ">
            <RxCross2
              className="size-5 cursor-pointer"
              onClick={() => setShowVerifyBox(false)}
            />
          </div>
          <div className="px-10 py-2">
            <div className="">
              <div className="text-xl font-semibold ">
                <div>Verify Your Email</div>
              </div>
              <div className="text-accent-foreground text-xs mt-1.5 ">
                <div>Enter Your Email to Receive a Verification Message</div>
              </div>
            </div>
            <div className="mt-8">
              <form onSubmit={sendMail}>
                <Label className="mb-3">Email</Label>
                <Input
                  placeholder="Enter Your Email"
                  onChange={onChange}
                  type="email"
                />
                <div className="flex justify-end pt-6">
                  <Button type="submit" disabled={disabled}>
                    {disabled ? "Sending" : "Send Mail"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmailForm;
