import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users2 } from "lucide-react";

interface CollectiveProgressCircleProps {
  totalProgress: number;
  memberCount: number;
  completedHabits: number;
  totalHabits: number;
}

const CollectiveProgressCircle = ({
  totalProgress,
  memberCount,
  completedHabits,
  totalHabits,
}: CollectiveProgressCircleProps) => {
  const size = 120;
  const circumference = 2 * Math.PI * (size / 2 - 8);
  const strokeDashoffset = circumference - (totalProgress / 100) * circumference;

  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-center text-lg font-semibold text-foreground flex items-center justify-center gap-2">
          <Users2 className="w-5 h-5 text-primary" />
          Group Progress Today
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="relative">
          <svg
            width={size}
            height={size}
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={size / 2 - 8}
              stroke="hsl(var(--muted))"
              strokeWidth="6"
              fill="transparent"
              className="opacity-20"
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={size / 2 - 8}
              stroke="url(#gradient)"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-in-out"
              strokeLinecap="round"
            />
            {/* Gradient definition */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--purple-glow))" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-foreground">
              {Math.round(totalProgress)}%
            </div>
            <div className="text-xs text-muted-foreground">complete</div>
          </div>
        </div>
        
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center space-x-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-foreground">{completedHabits}</div>
              <div className="text-xs text-muted-foreground">completed</div>
            </div>
            <div className="w-px h-8 bg-border"></div>
            <div className="text-center">
              <div className="font-semibold text-foreground">{totalHabits}</div>
              <div className="text-xs text-muted-foreground">total habits</div>
            </div>
            <div className="w-px h-8 bg-border"></div>
            <div className="text-center">
              <div className="font-semibold text-foreground">{memberCount}</div>
              <div className="text-xs text-muted-foreground">members</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CollectiveProgressCircle;