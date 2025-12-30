import { Badge } from "@/components/ui/badge";
import type { ProSubscriber } from "@/types/admin";

interface AdminProSubscriberCardProps {
  subscriber: ProSubscriber;
}

const AdminProSubscriberCard = ({ subscriber }: AdminProSubscriberCardProps) => {
  return (
    <div className="p-3 hover:bg-muted/30 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-foreground text-sm">{subscriber.name}</p>
          <p className="text-xs text-muted-foreground">{subscriber.email}</p>
        </div>
        <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-600">
          {subscriber.plan}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Renews: {new Date(subscriber.currentPeriodEnd).toLocaleDateString()}
      </p>
    </div>
  );
};

export default AdminProSubscriberCard;
