import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRooms } from "@/hooks/useRooms";

interface JoinRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const JoinRoomDialog = ({ open, onOpenChange }: JoinRoomDialogProps) => {
  const [inviteCode, setInviteCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const { joinRoom } = useRooms();

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;

    setIsJoining(true);
    try {
      const success = await joinRoom(inviteCode);
      if (success) {
        setInviteCode("");
        onOpenChange(false);
      }
    } finally {
      setIsJoining(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleJoin();
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to uppercase and limit to 6 characters
    const code = e.target.value.toUpperCase().slice(0, 6);
    setInviteCode(code);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join Room</DialogTitle>
          <DialogDescription>
            Enter the 6-character invite code to join a room and start tracking habits together.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-code">Invite Code</Label>
            <Input
              id="invite-code"
              placeholder="ABC123"
              value={inviteCode}
              onChange={handleCodeChange}
              className="text-center text-lg font-mono tracking-wider"
              maxLength={6}
              required
            />
            <p className="text-xs text-muted-foreground">
              Ask a room member for their invite code
            </p>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={inviteCode.length !== 6 || isJoining}
              variant="hero"
            >
              {isJoining ? "Joining..." : "Join Room"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JoinRoomDialog;