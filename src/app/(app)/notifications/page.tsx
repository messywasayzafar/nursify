
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { mockNotifications } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          View and manage all your recent notifications here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockNotifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "flex items-start gap-4 p-3 rounded-lg",
                !notification.read && "bg-muted/50"
              )}
            >
              <Avatar className="h-9 w-9">
                 <AvatarFallback>
                  <Bell className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="font-semibold">{notification.title}</p>
                <p className="text-sm text-muted-foreground">
                  {notification.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {notification.timestamp}
                </p>
              </div>
              {!notification.read && (
                <div className="ml-auto h-2 w-2 rounded-full bg-primary mt-1" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
