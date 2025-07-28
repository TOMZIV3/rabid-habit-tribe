import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, TrendingUp, Award, Target } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const History = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Mock data for the selected date
  const mockHistoryData = {
    completions: [
      { habitName: "Drink Water", completed: 6, target: 8, category: "health" },
      { habitName: "Morning Meditation", completed: 1, target: 1, category: "mind" },
      { habitName: "Exercise", completed: 0, target: 1, category: "health" },
    ],
    streaks: [
      { habitName: "Drink Water", currentStreak: 12, bestStreak: 24 },
      { habitName: "Morning Meditation", currentStreak: 7, bestStreak: 15 },
    ],
    weeklyStats: {
      totalCompletions: 42,
      targetCompletions: 56,
      bestDay: "Monday",
      completionRate: 75,
    }
  };

  const categoryColors = {
    mind: "bg-habit-mind/10 text-habit-mind",
    health: "bg-habit-health/10 text-habit-health", 
    home: "bg-habit-home/10 text-habit-home",
    errands: "bg-habit-errands/10 text-habit-errands",
  };

  const completionRate = Math.round(
    (mockHistoryData.completions.reduce((acc, h) => acc + Math.min(h.completed / h.target, 1), 0) / 
     mockHistoryData.completions.length) * 100
  );

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">History</h1>
          <p className="text-muted-foreground mt-1">Track your progress over time</p>
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(selectedDate, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Daily Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{completionRate}%</p>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">7</p>
                <p className="text-sm text-muted-foreground">Active Streaks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Award className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">24</p>
                <p className="text-sm text-muted-foreground">Best Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Completions */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Daily Progress - {format(selectedDate, "MMMM d, yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockHistoryData.completions.map((habit, index) => {
            const completionPercentage = Math.min((habit.completed / habit.target) * 100, 100);
            const isComplete = habit.completed >= habit.target;
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium text-foreground">{habit.habitName}</h3>
                    <Badge 
                      className={cn("text-xs", categoryColors[habit.category as keyof typeof categoryColors])}
                    >
                      {habit.category}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {habit.completed}/{habit.target}
                    </span>
                    {isComplete && (
                      <Badge className="bg-success/10 text-success text-xs">Complete</Badge>
                    )}
                  </div>
                </div>
                
                <div className="w-full bg-muted/20 rounded-full h-2">
                  <div 
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      isComplete ? "bg-success" : "bg-primary"
                    )}
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Streaks */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Current Streaks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockHistoryData.streaks.map((streak, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
              <div>
                <h3 className="font-medium text-foreground">{streak.habitName}</h3>
                <p className="text-sm text-muted-foreground">
                  Best: {streak.bestStreak} days
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{streak.currentStreak}</p>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {mockHistoryData.weeklyStats.totalCompletions}
              </p>
              <p className="text-sm text-muted-foreground">Completions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {mockHistoryData.weeklyStats.completionRate}%
              </p>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {mockHistoryData.weeklyStats.bestDay}
              </p>
              <p className="text-sm text-muted-foreground">Best Day</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {mockHistoryData.weeklyStats.targetCompletions}
              </p>
              <p className="text-sm text-muted-foreground">Target</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default History;