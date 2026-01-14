import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { NotificationItem } from "@/lib/types";

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onNotificationClick: (notification: NotificationItem) => void;
}

export function NotificationsPanel({
  open,
  onClose,
  notifications,
  onNotificationClick,
}: NotificationsPanelProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[350px] p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <SheetTitle>Notifications</SheetTitle>
              </div>
            </div>
          </SheetHeader>

          {/* Content */}
          {notifications.length > 0 ? (
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => onNotificationClick(notification)}
                    className={`p-2 rounded-lg border cursor-pointer transition-colors
                      ${!notification.read 
                        ? 'bg-primary/10 border-primary/20' 
                        : 'hover:bg-muted/50 border-borderColorPrimary'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-medium mb-1">{notification.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {notification.message.length > 70 ? notification.message.slice(0, 70) + '...' : notification.message}
                        </p>
                      </div>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-primary rounded-full mt-2" />
                      )}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
                        Math.round((notification.timestamp.getTime() - Date.now()) / (1000 * 60)),
                        'minute'
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-4">
              <Bell className="h-10 w-10 mb-4 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}