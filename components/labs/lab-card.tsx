import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Layers, Users } from "lucide-react";

interface LabCardProps {
  title: string;
  description: string | null;
  modulesCount: number;
  assignedGroupsCount?: number;
  createdAt: string;
  onClick?: () => void;
}

export function LabCard({
  title,
  description,
  modulesCount,
  assignedGroupsCount,
  createdAt,
  onClick,
}: LabCardProps) {
  return (
    <Card
      className="hover:shadow-lg transition-all hover:bg-accent/60 cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-xl group-hover:text-primary transition-colors">
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="line-clamp-2">
                {description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Layers className="h-4 w-4" />
            <span>{modulesCount} module{modulesCount !== 1 ? "s" : ""}</span>
          </div>
          {assignedGroupsCount !== undefined && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{assignedGroupsCount} group{assignedGroupsCount !== 1 ? "s" : ""}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
