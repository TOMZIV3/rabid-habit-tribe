import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Dumbbell, 
  Home, 
  Package, 
  Droplets, 
  BookOpen, 
  Coffee,
  Heart,
  Users,
  CheckCircle2,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HabitMember {
  id: string;
  displayName: string;
  avatarUrl?: string;
  completions: number;
  targetCount: number;
}

interface HabitCardProps {
  id: string;
  name: string;
  description?: string;
  category: "mind" | "health" | "home" | "errands";
  habitType: "daily" | "weekly" | "one-time" | "shared";
  targetCount: number;
  members: HabitMember[];
  isJoined: boolean;
  isCreator: boolean;
  onJoinHabit: (habitId: string) => void;
  onLeaveHabit: (habitId: string) => void;
  onComplete: (habitId: string, userId: string) => void;
}

const categoryConfig = {
  mind: { icon: Brain, color: "text-habit-mind", bg: "bg-habit-mind/10" },
  health: { icon: Dumbbell, color: "text-habit-health", bg: "bg-habit-health/10" },
  home: { icon: Home, color: "text-habit-home", bg: "bg-habit-home/10" },
  errands: { icon: Package, color: "text-habit-errands", bg: "bg-habit-errands/10" },
};

const getHabitIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("water") || lowerName.includes("drink")) return Droplets;
  if (lowerName.includes("read") || lowerName.includes("book")) return BookOpen;
  if (lowerName.includes("coffee") || lowerName.includes("tea")) return Coffee;
  if (lowerName.includes("workout") || lowerName.includes("exercise")) return Dumbbell;
  if (lowerName.includes("meditat")) return Brain;
  if (lowerName.includes("love") || lowerName.includes("gratitude")) return Heart;
  return CheckCircle2;
};

const ProgressCircle = ({ 
  current, 
  target, 
  size = 60, 
  member, 
  onComplete 
}: { 
  current: number; 
  target: number; 
  size?: number; 
  member: HabitMember;
  onComplete: () => void;
}) => {
  const percentage = Math.min((current / target) * 100, 100);
  const isComplete = current >= target;
  
  return (
    <div className="flex flex-col items-center space-y-2">
      <Button
        variant="progress"
        size="progress"
        onClick={onComplete}
        className={cn(
          "relative transition-all duration-300 hover:scale-105",
          isComplete && "bg-success hover:bg-success/90 text-white"
        )}
        style={{ width: size, height: size }}
      >
        <div className="text-xs font-bold">
          {current}/{target}
        </div>
        <div 
          className="absolute inset-0 rounded-full border-4 border-transparent"
          style={{
            background: `conic-gradient(from 0deg, hsl(var(--primary)) ${percentage}%, transparent ${percentage}%)`,
            borderRadius: '50%',
          }}
        />
      </Button>
      <div className="text-center">
        <p className="text-xs font-medium text-foreground">{member.displayName}</p>
        {isComplete && (
          <div className="flex items-center justify-center mt-1">
            <CheckCircle2 className="w-3 h-3 text-success" />
          </div>
        )}
      </div>
    </div>
  );
};

const HabitCard = ({
  id,
  name,
  description,
  category,
  habitType,
  targetCount,
  members,
  isJoined,
  isCreator,
  onJoinHabit,
  onLeaveHabit,
  onComplete,
}: HabitCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const CategoryIcon = categoryConfig[category].icon;
  const HabitIcon = getHabitIcon(name);
  
  const currentUser = members.find(member => member.id === "current-user-id"); // TODO: Replace with actual user ID
  const otherMembers = members.filter(member => member.id !== "current-user-id");

  return (
    <Card className="bg-gradient-card border-border hover:border-primary/30 transition-all duration-300 animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn("p-2 rounded-lg", categoryConfig[category].bg)}>
              <HabitIcon className={cn("w-5 h-5", categoryConfig[category].color)} />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">{name}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {habitType}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <CategoryIcon className="w-3 h-3 mr-1" />
                  {category}
                </Badge>
                {isCreator && (
                  <Badge variant="default" className="text-xs bg-primary/20 text-primary">
                    Creator
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
        
        {description && (
          <p className="text-sm text-muted-foreground mt-2">{description}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isJoined ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              Join this habit to start tracking your progress
            </p>
            <Button onClick={() => onJoinHabit(id)} variant="hero" className="w-full">
              <Users className="w-4 h-4 mr-2" />
              Join Habit
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Today's Progress</span>
              <span className="text-xs text-muted-foreground">
                {members.length} member{members.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {currentUser && (
                <ProgressCircle
                  current={currentUser.completions}
                  target={targetCount}
                  member={currentUser}
                  onComplete={() => onComplete(id, currentUser.id)}
                />
              )}
              {otherMembers.map((member) => (
                <ProgressCircle
                  key={member.id}
                  current={member.completions}
                  target={targetCount}
                  member={member}
                  onComplete={() => onComplete(id, member.id)}
                />
              ))}
            </div>
            
            {isExpanded && (
              <div className="space-y-3 animate-fade-in">
                <div className="border-t pt-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Target:</span>
                      <span className="ml-1 font-medium">{targetCount}/day</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="ml-1 font-medium capitalize">{habitType}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {isCreator && (
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit Habit
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-destructive hover:bg-destructive/10"
                    onClick={() => onLeaveHabit(id)}
                  >
                    Leave Habit
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default HabitCard;