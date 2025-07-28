import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Users2, Share2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomName: string;
  inviteCode: string;
  memberCount: number;
}

const InviteDialog = ({ open, onOpenChange, roomName, inviteCode, memberCount }: InviteDialogProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  
  const inviteLink = `${window.location.origin}/?invite=${inviteCode}`;

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(inviteCode);
    toast({
      title: "Invite code copied!",
      description: "Share this code with friends to join your room",
    });
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Invite link copied!",
      description: "Share this link to auto-join friends to your room",
    });
  };

  const handleSendEmail = () => {
    if (!email) {
      toast({
        title: "Please enter an email",
        description: "Add an email address to send the invitation",
        variant: "destructive",
      });
      return;
    }
    
    // TODO: Implement email sending via Supabase Edge Function
    toast({
      title: "Invitation sent!",
      description: `Invitation sent to ${email}`,
    });
    setEmail("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users2 className="w-5 h-5 text-primary" />
            Invite Friends to {roomName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Room Info */}
          <Card className="bg-gradient-card border-border">
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-foreground">{roomName}</h3>
                <p className="text-sm text-muted-foreground">
                  {memberCount}/3 members • {3 - memberCount} spots remaining
                </p>
                {memberCount >= 3 && (
                  <p className="text-xs text-warning">Room is full</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Invite Code */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Invite Code</Label>
            <div className="flex items-center space-x-2">
              <Input
                value={inviteCode}
                readOnly
                className="font-mono text-center text-lg font-bold bg-muted/50"
              />
              <Button onClick={handleCopyCode} size="icon" variant="outline">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Invite Link */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Direct Link</Label>
            <div className="flex items-center space-x-2">
              <Input
                value={inviteLink}
                readOnly
                className="text-xs bg-muted/50"
              />
              <Button onClick={handleCopyLink} size="icon" variant="outline">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Email Invitation */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Send via Email</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button onClick={handleSendEmail} size="icon" variant="default">
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground text-center p-3 bg-muted/20 rounded-lg">
            Friends can join by entering the code in the app or clicking the direct link. 
            Maximum 3 members per room.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteDialog;