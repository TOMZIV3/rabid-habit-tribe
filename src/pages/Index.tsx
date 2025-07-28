import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import AuthForm from "@/components/AuthForm";
import Home from "./Home";
import History from "./History";
import Profile from "./Profile"; 
import Notifications from "./Notifications";
import BottomNavigation from "@/components/BottomNavigation";
import { useLocation } from "react-router-dom";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");
  const isMobile = useIsMobile();
  const location = useLocation();

  // Mock authentication - will be replaced with Supabase
  useEffect(() => {
    // For demo purposes, show auth form initially
    // setIsAuthenticated(true);
  }, []);

  // Handle navigation based on URL path
  useEffect(() => {
    const path = location.pathname;
    if (path === "/") setCurrentPage("home");
    else if (path === "/history") setCurrentPage("history");
    else if (path === "/notifications") setCurrentPage("notifications");
    else if (path === "/profile") setCurrentPage("profile");
  }, [location.pathname]);

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case "history":
        return <History />;
      case "notifications":
        return <Notifications />;
      case "profile":
        return <Profile />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className={isMobile ? "pb-20" : ""}>
        {renderPage()}
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && <BottomNavigation unreadNotifications={2} />}
    </div>
  );
};

export default Index;
