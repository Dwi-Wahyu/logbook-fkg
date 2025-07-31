import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  description?: string; // Optional description
  accentColorClass?: string; // Optional accent color class
}

export default function DashboardCard({
  icon: Icon,
  title,
  value,
  description,
  accentColorClass = "text-primary-foreground", // Default accent color
}: DashboardCardProps) {
  return (
    <Card className="shadow-lg rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <Icon className={`h-5 w-5 text-muted-foreground ${accentColorClass}`} />{" "}
        {/* Icon with accent */}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
