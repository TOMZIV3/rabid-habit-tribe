import HabitCard from "@/components/HabitCard";
import RoomSelector from "@/components/RoomSelector";
import CreateHabitDialog from "@/components/CreateHabitDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users2, Target, Calendar, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useHabits } from "@/hooks/useHabits";
import { useRooms } from "@/hooks/useRooms";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Home = () => {
  const { habits, loading, joinHabit, leaveHabit, completeHabit, refetch } = useHabits();
  const { currentRoom } = useRooms();
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const handleJoinHabit = (habitId: string) => {
    joinHabit(habitId);
  };

  const handleLeaveHabit = (habitId: string) => {
    leaveHabit(habitId);
  };

  const handleComplete = (habitId: string, userId: string) => {
    completeHabit(habitId);
  };

  const handleCreateHabit = () => {
    setShowCreateDialog(true);
  };

  const totalHabits = habits.length;
  const joinedHabits = habits.filter(h => h.isJoined).length;
  const completedToday = habits.filter(h => {
    if (!h.isJoined || !currentUserId) return false;
    const userMember = h.members.find(m => m.id === currentUserId);
    return userMember && userMember.completions >= h.targetCount;
  }).length;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Good Morning! 👋</h1>
          <p className="text-muted-foreground mt-1">
            {currentRoom ? `Room: ${currentRoom.name}` : "Select or join a room to get started"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RoomSelector className="min-w-[200px]" />
          <Button onClick={handleCreateHabit} variant="hero" size="lg" disabled={!currentRoom}>
            <Plus className="w-5 h-5 mr-2" />
            Create Habit
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{joinedHabits}</p>
                <p className="text-sm text-muted-foreground">Active Habits</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Zap className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{completedToday}</p>
                <p className="text-sm text-muted-foreground">Completed Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-habit-mind/10 rounded-lg">
                <Users2 className="w-5 h-5 text-habit-mind" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{currentRoom?.memberCount || 0}</p>
                <p className="text-sm text-muted-foreground">Habit Buddies</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Calendar className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">7</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Habits Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Your Habits</h2>
          <p className="text-sm text-muted-foreground">
            {joinedHabits} of {totalHabits} habits joined
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              {...habit}
              onJoinHabit={handleJoinHabit}
              onLeaveHabit={handleLeaveHabit}
              onComplete={handleComplete}
            />
          ))}
        </div>

        {habits.length === 0 && (
          <Card className="bg-gradient-card border-border text-center py-12">
            <CardContent>
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center">
                  <Target className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {currentRoom ? "No habits yet" : "No room selected"}
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    {currentRoom 
                      ? "Create your first habit to start tracking" 
                      : "Create or join a room to start tracking habits together"
                    }
                  </p>
                </div>
                {currentRoom && (
                  <Button onClick={handleCreateHabit} variant="hero">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Habit
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <CreateHabitDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={refetch}
      />
    </div>
  );
};

export default Home;