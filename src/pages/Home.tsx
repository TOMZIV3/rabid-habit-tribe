import HabitCard from "@/components/HabitCard";
import RoomSelector from "@/components/RoomSelector";
import CreateHabitDialog from "@/components/CreateHabitDialog";
import CollectiveProgressCircle from "@/components/CollectiveProgressCircle";
import DaySelector from "@/components/DaySelector";
import InviteDialog from "@/components/InviteDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users2, Target, Calendar, Zap, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useHabits } from "@/hooks/useHabits";
import { useRooms } from "@/hooks/useRooms";
import { useCompletionData } from "@/hooks/useCompletionData";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday } from "date-fns";

const Home = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { habits, loading, joinHabit, leaveHabit, completeHabit, refetch } = useHabits(selectedDate);
  const { currentRoom } = useRooms();
  const { completionData } = useCompletionData();
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

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

  const handleComplete = (habitId: string) => {
    // Only allow completion for today
    if (isToday(selectedDate)) {
      completeHabit(habitId);
    } else {
      toast({
        title: "Cannot complete",
        description: "You can only complete habits for today",
        variant: "destructive"
      });
    }
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

  // Calculate collective progress
  const totalMemberCompletions = habits.reduce((acc, habit) => {
    if (!habit.isJoined) return acc;
    return acc + habit.members.reduce((memberAcc, member) => {
      return memberAcc + Math.min(member.completions, habit.targetCount);
    }, 0);
  }, 0);

  const totalPossibleCompletions = habits.reduce((acc, habit) => {
    if (!habit.isJoined) return acc;
    return acc + (habit.members.length * habit.targetCount);
  }, 0);

  const collectiveProgress = totalPossibleCompletions > 0 
    ? (totalMemberCompletions / totalPossibleCompletions) * 100 
    : 0;

  const totalRoomMembers = currentRoom?.memberCount || 0;

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
      {/* Header with prominent room name */}
      {currentRoom && (
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border mb-6 -mx-4 px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-purple rounded-full flex items-center justify-center shadow-glow">
              <Users2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-text bg-clip-text text-transparent">
                {currentRoom.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentRoom.memberCount} member{currentRoom.memberCount !== 1 ? 's' : ''} • {format(selectedDate, 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Good Morning! 👋</h1>
          <p className="text-muted-foreground mt-1">
            {currentRoom ? "Let's track some habits together" : "Select or join a room to get started"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RoomSelector className="min-w-[200px]" />
          {currentRoom && (
            <Button 
              onClick={() => setShowInviteDialog(true)} 
              variant="outline" 
              size="lg"
              disabled={totalRoomMembers >= 3}
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Invite Friends
            </Button>
          )}
          <Button onClick={handleCreateHabit} variant="hero" size="lg" disabled={!currentRoom}>
            <Plus className="w-5 h-5 mr-2" />
            Create Habit
          </Button>
        </div>
      </div>

      {/* Day Selector */}
      {currentRoom && (
        <DaySelector
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          completionData={completionData}
        />
      )}

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

      {/* Collective Progress */}
      {currentRoom && joinedHabits > 0 && (
        <CollectiveProgressCircle
          totalProgress={collectiveProgress}
          memberCount={totalRoomMembers}
          completedHabits={completedToday}
          totalHabits={joinedHabits}
        />
      )}

      {/* Habits Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            Your Habits {!isToday(selectedDate) && `for ${format(selectedDate, 'MMM d')}`}
          </h2>
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
              isToday={isToday(selectedDate)}
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
      
      {currentRoom && (
        <InviteDialog
          open={showInviteDialog}
          onOpenChange={setShowInviteDialog}
          roomName={currentRoom.name}
          inviteCode={currentRoom.inviteCode || ""}
          memberCount={totalRoomMembers}
        />
      )}
    </div>
  );
};

export default Home;