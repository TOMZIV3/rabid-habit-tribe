import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import AuthForm from "@/components/AuthForm";
import FloatingActionButton from "@/components/FloatingActionButton";
import Home from "./Home";
import History from "./History";
import Profile from "./Profile"; 
import Notifications from "./Notifications";
import BottomNavigation from "@/components/BottomNavigation";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState("home");
  const isMobile = useIsMobile();
  const location = useLocation();

  // Setup authentication state management
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle navigation based on URL path
  useEffect(() => {
    const path = location.pathname;
    if (path === "/") setCurrentPage("home");
    else if (path === "/history") setCurrentPage("history");
    else if (path === "/notifications") setCurrentPage("notifications");
    else if (path === "/profile") setCurrentPage("profile");
  }, [location.pathname]);

  if (!session || !user) {
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

      {/* Mobile UI */}
      {isMobile && (
        <>
          <BottomNavigation />
          <FloatingActionButton />
        </>
      )}
    </div>
  );
};

export default Index;
