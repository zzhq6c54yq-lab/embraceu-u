import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Bell, Crown, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { NotificationTarget } from "@/types/admin";

const AdminNotificationForm = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState<NotificationTarget>("all");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Please enter both title and message");
      return;
    }

    setIsSending(true);
    try {
      const passcode1 = sessionStorage.getItem('admin_passcode_1');
      const passcode2 = sessionStorage.getItem('admin_passcode_2');
      const passcode3 = sessionStorage.getItem('admin_passcode_3');

      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          title: title.trim(),
          body: body.trim(),
          pro_only: target === "pro",
          data: { type: 'admin_announcement' }
        },
        headers: {
          'x-admin-passcode-1': passcode1 || '',
          'x-admin-passcode-2': passcode2 || '',
          'x-admin-passcode-3': passcode3 || ''
        }
      });

      if (error) {
        console.error('Push notification error:', error);
        toast.error("Failed to send notification", { description: error.message });
        return;
      }

      toast.success("Notification sent!", {
        description: `Sent: ${data?.sent || 0}, Failed: ${data?.failed || 0}`
      });

      setTitle("");
      setBody("");
    } catch (err) {
      console.error('Error sending notification:', err);
      toast.error("Failed to send notification");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="mt-8">
      <h2 className="text-label mb-4 flex items-center gap-2">
        <Bell className="w-4 h-4 text-primary" />
        SEND ANNOUNCEMENT
      </h2>
      <div className="card-embrace p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="notification-title" className="text-sm font-medium mb-2 block">
              Title
            </Label>
            <Input
              id="notification-title"
              placeholder="Notification title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="bg-background"
            />
          </div>
          <div>
            <Label htmlFor="notification-body" className="text-sm font-medium mb-2 block">
              Message
            </Label>
            <Textarea
              id="notification-body"
              placeholder="Your announcement message..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={500}
              rows={3}
              className="bg-background resize-none"
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-3 block">Send to</Label>
            <RadioGroup
              value={target}
              onValueChange={(val) => setTarget(val as NotificationTarget)}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="target-all" />
                <Label htmlFor="target-all" className="cursor-pointer">All Users</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pro" id="target-pro" />
                <Label htmlFor="target-pro" className="cursor-pointer flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  Pro Subscribers Only
                </Label>
              </div>
            </RadioGroup>
          </div>
          <Button
            onClick={handleSend}
            disabled={isSending || !title.trim() || !body.trim()}
            className="w-full"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Notification
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Notifications will be sent to users who have installed the app and enabled push notifications.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AdminNotificationForm;
