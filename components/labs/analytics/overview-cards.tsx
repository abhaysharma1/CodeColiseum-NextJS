import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, PlayCircle, CheckCircle2, TrendingUp } from "lucide-react";

interface OverviewCardsProps {
  totalStudents: number;
  started: number;
  completed: number;
  completionRate: number;
}

export function OverviewCards({
  totalStudents,
  started,
  completed,
  completionRate,
}: OverviewCardsProps) {
  const cards = [
    {
      title: "Assigned Students",
      value: totalStudents,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
    },
    {
      title: "Started",
      value: started,
      icon: PlayCircle,
      color: "text-yellow-600",
      bg: "bg-yellow-500/10",
    },
    {
      title: "Completed",
      value: completed,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-500/10",
    },
    {
      title: "Completion Rate",
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-md ${card.bg}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
