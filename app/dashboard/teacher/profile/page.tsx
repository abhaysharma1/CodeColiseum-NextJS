import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";

export default function ProfilePage() {
  return (
    <div className="container mx-auto max-w-4xl py-10">
      <div className="space-y-8">
        {/* HEADER */}
        <SiteHeader name="Profile" />
        <Card>
          <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-xl font-semibold">
                  AR
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <h1 className="text-xl font-semibold">Your Name</h1>
                <p className="text-sm text-muted-foreground">
                  Full Stack Developer
                </p>
                <div className="flex gap-2">
                  <Badge variant="secondary">Student</Badge>
                  <Badge variant="secondary">India</Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline">Edit Profile</Button>
              <Button variant="destructive">Logout</Button>
            </div>
          </CardContent>
        </Card>

        {/* PROFILE DETAILS */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Basic information about your account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoItem label="Email" value="youremail@example.com" />
              <InfoItem label="Username" value="yourusername" />
              <InfoItem label="Role" value="B.Tech CSE Student" />
              <InfoItem label="Joined" value="January 2025" />
            </div>
          </CardContent>
        </Card>

        {/* STATS */}
        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
            <CardDescription>Your platform statistics</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <StatItem label="Projects" value="05" />
              <StatItem label="Contributions" value="128" />
              <StatItem label="Experience" value="2+ yrs" />
            </div>
          </CardContent>
        </Card>

        {/* BIO */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>Short bio</CardDescription>
          </CardHeader>

          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              This is a placeholder bio section. You can describe yourself, your
              interests, tech stack, or what you’re currently working on. Keep
              it concise and readable.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ------------------ Helpers ------------------ */

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">{label}</p>
      <p className="text-sm text-muted-foreground">{value}</p>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
