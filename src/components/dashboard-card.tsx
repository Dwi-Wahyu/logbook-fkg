import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface DashboardCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
}

export default function DashboardCard({
  icon: Icon,
  title,
  value,
}: DashboardCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{value}</h1>
        <Icon className="w-10 h-10" />
      </CardContent>
    </Card>
  );
}
