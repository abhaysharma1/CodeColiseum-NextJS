"use client";

import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { getBackendURL } from "@/utils/utilities";

type Role = "ADMIN" | "TEACHER" | "STUDENT";

type UserSummary = {
  id: string;
  name: string;
  email: string;
  role: Role;
  globalRoleId: string | null;
};

const randomChars =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$%";

function generateTemporaryPassword(length = 12): string {
  const chars = randomChars;
  let value = "";

  for (let i = 0; i < length; i += 1) {
    value += chars[Math.floor(Math.random() * chars.length)];
  }

  return value;
}

export default function SingleSignUpPage() {
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: generateTemporaryPassword(),
    role: "STUDENT" as Role,
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createdUser, setCreatedUser] = useState<UserSummary | null>(null);

  const [assignForm, setAssignForm] = useState({
    email: "",
    role: "STUDENT" as Role,
  });
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignedUser, setAssignedUser] = useState<UserSummary | null>(null);

  const [resetForm, setResetForm] = useState({
    email: "",
    newPassword: generateTemporaryPassword(),
    revokeSessions: true,
  });
  const [resetLoading, setResetLoading] = useState(false);

  const handleCreateUser = async () => {
    if (
      !createForm.name.trim() ||
      !createForm.email.trim() ||
      !createForm.password.trim()
    ) {
      toast.error("Name, email, and password are required.");
      return;
    }

    setCreateLoading(true);
    setCreatedUser(null);

    try {
      const response = await axios.post(
        `${getBackendURL()}/admin/single-signup`,
        {
          name: createForm.name.trim(),
          email: createForm.email.trim().toLowerCase(),
          password: createForm.password,
          role: createForm.role,
        },
        { withCredentials: true }
      );

      setCreatedUser((response.data as { user: UserSummary }).user);
      toast.success("User created successfully.");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.response?.data?.error ??
        "Failed to create user";
      toast.error(message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!assignForm.email.trim()) {
      toast.error("Email is required.");
      return;
    }

    setAssignLoading(true);
    setAssignedUser(null);

    try {
      const response = await axios.patch(
        `${getBackendURL()}/admin/assign-role`,
        {
          email: assignForm.email.trim().toLowerCase(),
          role: assignForm.role,
        },
        { withCredentials: true }
      );

      setAssignedUser((response.data as { user: UserSummary }).user);
      toast.success("Role updated successfully.");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.response?.data?.error ??
        "Failed to assign role";
      toast.error(message);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetForm.email.trim() || !resetForm.newPassword.trim()) {
      toast.error("Email and new password are required.");
      return;
    }

    setResetLoading(true);

    try {
      await axios.post(
        `${getBackendURL()}/admin/reset-password-by-email`,
        {
          email: resetForm.email.trim().toLowerCase(),
          newPassword: resetForm.newPassword,
          revokeSessions: resetForm.revokeSessions,
        },
        { withCredentials: true }
      );

      toast.success("Password reset successfully.");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.response?.data?.error ??
        "Failed to reset password";
      toast.error(message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-6">
      <div>
        <h1 className="text-xl font-bold">Single User Management</h1>
        <p className="text-muted-foreground text-xs mt-0.5">
          Create one user, assign role, or reset password by email.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create User</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Jane Doe"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="jane@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Temporary Password</Label>
              <div className="flex gap-2">
                <Input
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  placeholder="Temporary password"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setCreateForm((prev) => ({
                      ...prev,
                      password: generateTemporaryPassword(),
                    }))
                  }
                >
                  Generate
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select
                value={createForm.role}
                onValueChange={(value) =>
                  setCreateForm((prev) => ({ ...prev, role: value as Role }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleCreateUser} disabled={createLoading}>
            {createLoading ? "Creating..." : "Create User"}
          </Button>

          {createdUser && (
            <p className="text-xs text-muted-foreground">
              Created: {createdUser.name} ({createdUser.email}) as{" "}
              {createdUser.role}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assign Role</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>User Email</Label>
              <Input
                type="email"
                value={assignForm.email}
                onChange={(e) =>
                  setAssignForm((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label>New Role</Label>
              <Select
                value={assignForm.role}
                onValueChange={(value) =>
                  setAssignForm((prev) => ({ ...prev, role: value as Role }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleAssignRole} disabled={assignLoading}>
            {assignLoading ? "Updating..." : "Assign Role"}
          </Button>

          {assignedUser && (
            <p className="text-xs text-muted-foreground">
              Updated: {assignedUser.email} is now {assignedUser.role}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reset Password By Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>User Email</Label>
              <Input
                type="email"
                value={resetForm.email}
                onChange={(e) =>
                  setResetForm((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label>New Password</Label>
              <div className="flex gap-2">
                <Input
                  value={resetForm.newPassword}
                  onChange={(e) =>
                    setResetForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder="New password"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setResetForm((prev) => ({
                      ...prev,
                      newPassword: generateTemporaryPassword(),
                    }))
                  }
                >
                  Generate
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={resetForm.revokeSessions}
              onCheckedChange={(checked) =>
                setResetForm((prev) => ({ ...prev, revokeSessions: checked }))
              }
              id="revokeSessions"
            />
            <Label htmlFor="revokeSessions">Revoke active sessions</Label>
          </div>

          <Button onClick={handleResetPassword} disabled={resetLoading}>
            {resetLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
