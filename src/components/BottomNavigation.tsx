import { NavLink, useLocation } from "react-router-dom";
import { Home, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/useProfile";

interface BottomNavigationProps {}

const BottomNavigation = ({}: BottomNavigationProps) => {
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const { profile } = useProfile();

  const navItems = [
    { to: "/", icon: Home, label: "Home", isProfile: false },
    { to: "/history", icon: BarChart3, label: "Progress", isProfile: false },
    { to: "/profile", icon: User, label: "Profile", isProfile: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 relative",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <div className="relative">
                {item.to === "/profile" ? (
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {profile?.display_name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <item.icon className="w-5 h-5" />
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;