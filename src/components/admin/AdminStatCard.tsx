import { cn } from "@/lib/utils";

interface AdminStatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color?: string;
  trend?: number;
  isLoading?: boolean;
}

const AdminStatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  color = "text-primary",
  trend,
  isLoading = false
}: AdminStatCardProps) => {
  return (
    <div className="card-embrace text-center py-5 transition-all duration-200 hover:shadow-card">
      <Icon className={cn("w-6 h-6 mx-auto mb-2", color)} />
      {isLoading ? (
        <div className="h-8 w-16 mx-auto mb-1 rounded bg-muted animate-pulse" />
      ) : (
        <p className="text-2xl font-semibold text-foreground mb-1">
          {value.toLocaleString()}
        </p>
      )}
      <p className="text-label text-xs">{label}</p>
      {trend !== undefined && trend !== 0 && (
        <p className={cn(
          "text-xs mt-1 font-medium",
          trend > 0 ? "text-green-600" : "text-red-500"
        )}>
          {trend > 0 ? "+" : ""}{trend}%
        </p>
      )}
    </div>
  );
};

export default AdminStatCard;
