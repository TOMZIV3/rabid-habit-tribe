import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreateHabitDialog from "./CreateHabitDialog";
import { useRooms } from "@/hooks/useRooms";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  className?: string;
}

const FloatingActionButton = ({ className }: FloatingActionButtonProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { currentRoom } = useRooms();

  return (
    <>
      <Button
        variant="hero"
        size="circle"
        className={cn(
          "fixed bottom-20 right-4 z-50 shadow-glow animate-bounce",
          "md:hidden", // Only show on mobile
          className
        )}
        onClick={() => setShowCreateDialog(true)}
        disabled={!currentRoom}
      >
        <Plus className="w-6 h-6" />
      </Button>

      <CreateHabitDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
};

export default FloatingActionButton;