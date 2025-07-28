import { useState } from "react";
import HabitCard from "@/components/HabitCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users2, Target, Calendar, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data - will be replaced with Supabase data
const mockHabits = [
  {
    id: "1",
    name: "Drink Water",
    description: "Stay hydrated throughout the day",
    category: "health" as const,
    habitType: "daily" as const,
    targetCount: 8,
    members: [
      { id: "current-user-id", displayName: "You", completions: 3, targetCount: 8 },
      { id: "user-2", displayName: "Sarah", completions: 6, targetCount: 8 },
      { id: "user-3", displayName: "Mike", completions: 8, targetCount: 8 },
    ],
    isJoined: true,
    isCreator: true,
  },
  {
    id: "2",
    name: "Morning Meditation",
    description: "Start the day with mindfulness",
    category: "mind" as const,
    habitType: "daily" as const,
    targetCount: 1,
    members: [
      { id: "current-user-id", displayName: "You", completions: 1, targetCount: 1 },
      { id: "user-2", displayName: "Sarah", completions: 0, targetCount: 1 },
    ],
    isJoined: true,
    isCreator: false,
  },
  {
    id: "3",
    name: "Read Books",
    description: "Read for at least 30 minutes daily",
    category: "mind" as const,
    habitType: "daily" as const,
    targetCount: 1,
    members: [
      { id: "user-2", displayName: "Sarah", completions: 1, targetCount: 1 },
      { id: "user-3", displayName: "Mike", completions: 0, targetCount: 1 },
    ],
    isJoined: false,
    isCreator: false,
  },
];

const Home = () => {
  const [habits] = useState(mockHabits);
  const { toast } = useToast();

  const handleJoinHabit = (habitId: string) => {
    toast({
      title: "Feature Coming Soon",
      description: "Connect to Supabase to enable habit joining",
    });
  };

  const handleLeaveHabit = (habitId: string) => {
    toast({
      title: "Feature Coming Soon", 
      description: "Connect to Supabase to enable habit management",
    });
  };

  const handleComplete = (habitId: string, userId: string) => {
    toast({
      title: "Progress Updated! 🎉",
      description: "Your habit completion has been recorded",
    });
  };

  const handleCreateHabit = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Connect to Supabase to enable habit creation",
    });
  };

  const totalHabits = habits.length;
  const joinedHabits = habits.filter(h => h.isJoined).length;
  const completedToday = habits.filter(h => 
    h.isJoined && h.members.find(m => m.id === "current-user-id")?.completions! >= h.targetCount
  ).length;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Good Morning! 👋</h1>
          <p className="text-muted-foreground mt-1">Let's build great habits together</p>
        </div>
        <Button onClick={handleCreateHabit} variant="hero" size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Create Habit
        </Button>
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
                <p className="text-2xl font-bold text-foreground">3</p>
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
                  <h3 className="text-lg font-semibold text-foreground">No habits yet</h3>
                  <p className="text-muted-foreground mt-1">
                    Create your first habit or join a room to get started
                  </p>
                </div>
                <Button onClick={handleCreateHabit} variant="hero">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Habit
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Home;