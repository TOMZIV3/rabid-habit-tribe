import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  Heart, 
  Zap, 
  Target, 
  CheckCircle2, 
  MessageCircle,
  Gift,
  TrendingUp
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "nudge" | "achievement" | "reminder" | "celebration";
  fromUser?: {
    displayName: string;
    avatarUrl?: string;
  };
  habitName?: string;
  message: string;
  createdAt: Date;
  read: boolean;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "nudge",
      fromUser: { displayName: "Sarah", avatarUrl: "" },
      habitName: "Morning Meditation",
      message: "Hey! Don't forget your morning meditation today 🧘‍♀️",
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: false,
    },
    {
      id: "2", 
      type: "achievement",
      message: "🎉 Congratulations! You've completed a 7-day streak for Drink Water!",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
    },
    {
      id: "3",
      type: "celebration",
      fromUser: { displayName: "Mike", avatarUrl: "" },
      habitName: "Exercise",
      message: "Mike just completed their Exercise habit! Send them some love ❤️",
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      read: true,
    },
    {
      id: "4",
      type: "reminder",
      message: "⏰ Daily reminder: You have 3 habits left to complete today",
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      read: true,
    },
    {
      id: "5",
      type: "nudge",
      fromUser: { displayName: "Alex", avatarUrl: "" },
      habitName: "Read Books",
      message: "Come on, just 20 minutes of reading! You got this! 📚",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case "nudge":
        return <Heart className="w-5 h-5 text-destructive" />;
      case "achievement":
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case "celebration":
        return <Gift className="w-5 h-5 text-warning" />;
      case "reminder":
        return <Bell className="w-5 h-5 text-info" />;
      default:
        return <MessageCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case "nudge":
        return "bg-destructive/10 border-destructive/20";
      case "achievement":
        return "bg-success/10 border-success/20";
      case "celebration":
        return "bg-warning/10 border-warning/20";
      case "reminder":
        return "bg-info/10 border-info/20";
      default:
        return "bg-muted/10 border-border";
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Bell className="w-8 h-8 text-foreground" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 w-6 h-6 p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up! 🎉'}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              Mark All Read
            </Button>
          )}
          <Button variant="outline" onClick={clearAll}>
            Clear All
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card className="bg-gradient-card border-border text-center py-12">
            <CardContent>
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center">
                  <Bell className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">No notifications</h3>
                  <p className="text-muted-foreground mt-1">
                    You're all caught up! Check back later for updates from your habit buddies.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification, index) => (
            <Card 
              key={notification.id}
              className={cn(
                "transition-all duration-200 cursor-pointer hover:shadow-md",
                notification.read 
                  ? "bg-gradient-card border-border opacity-75" 
                  : cn("bg-gradient-card border-2", getNotificationColor(notification.type))
              )}
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* From User */}
                        {notification.fromUser && (
                          <div className="flex items-center space-x-2 mb-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={notification.fromUser.avatarUrl} />
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {notification.fromUser.displayName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-foreground">
                              {notification.fromUser.displayName}
                            </span>
                            {notification.habitName && (
                              <>
                                <span className="text-muted-foreground">•</span>
                                <Badge variant="outline" className="text-xs">
                                  {notification.habitName}
                                </Badge>
                              </>
                            )}
                          </div>
                        )}
                        
                        {/* Message */}
                        <p className="text-foreground leading-relaxed">
                          {notification.message}
                        </p>
                        
                        {/* Timestamp */}
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                        </p>
                      </div>
                      
                      {/* Unread indicator */}
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              
              {index < notifications.length - 1 && <Separator />}
            </Card>
          ))
        )}
      </div>

      {/* Quick Actions */}
      {notifications.length > 0 && (
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start">
                <Zap className="w-4 h-4 mr-2" />
                Send Nudge
              </Button>
              <Button variant="outline" className="justify-start">
                <Target className="w-4 h-4 mr-2" />
                View Habits
              </Button>
              <Button variant="outline" className="justify-start">
                <TrendingUp className="w-4 h-4 mr-2" />
                Check Progress
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Notifications;