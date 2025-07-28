import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Users, Heart } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

interface NudgeButtonProps {
  toUserId: string;
  habitId: string;
  habitName: string;
  userName: string;
  className?: string;
  size?: "sm" | "default" | "lg";
}

const NudgeButton = ({ 
  toUserId, 
  habitId, 
  habitName, 
  userName, 
  className,
  size = "sm"
}: NudgeButtonProps) => {
  const [isNudging, setIsNudging] = useState(false);
  const { sendNudge } = useNotifications();

  const handleNudge = async () => {
    if (isNudging) return;
    
    setIsNudging(true);
    try {
      await sendNudge(toUserId, habitId);
    } finally {
      setIsNudging(false);
    }
  };

  return (
    <Button
      onClick={handleNudge}
      disabled={isNudging}
      variant="outline"
      size={size}
      className={cn(
        "text-habit-health hover:bg-habit-health/10 border-habit-health/20 transition-all duration-200",
        isNudging && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <Heart className="w-3 h-3 mr-1" />
      {isNudging ? "..." : "Nudge"}
    </Button>
  );
};

export default NudgeButton;