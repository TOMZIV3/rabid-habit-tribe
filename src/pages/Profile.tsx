import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Bell, 
  Users, 
  Settings, 
  LogOut, 
  Edit2,
  Crown,
  Calendar,
  Target,
  Award
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("John Doe");
  const [email] = useState("john.doe@example.com");
  const [notifications, setNotifications] = useState({
    nudges: true,
    dailyReminders: true,
    weeklyReports: false,
  });
  const { toast } = useToast();

  // Mock user data
  const userStats = {
    joinDate: "March 2024",
    totalHabits: 12,
    activeHabits: 8,
    completedHabits: 4,
    totalRooms: 3,
    longestStreak: 24,
    currentStreak: 7,
    completionRate: 78,
  };

  const userRooms = [
    { id: "1", name: "Family Fitness", role: "creator", members: 4 },
    { id: "2", name: "Study Buddies", role: "member", members: 3 },
    { id: "3", name: "Mindfulness Group", role: "member", members: 5 },
  ];

  const handleSaveProfile = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Connect to Supabase to enable profile updates",
    });
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Sign Out Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signed Out",
          description: "You have been successfully signed out",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    toast({
      title: "Feature Coming Soon",
      description: "Connect to Supabase to save notification preferences",
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>

      {/* Profile Info */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground">
              Personal Information
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src="" alt={displayName} />
              <AvatarFallback className="text-xl bg-primary/10 text-primary">
                {displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="display-name">Display Name</Label>
                    <Input
                      id="display-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                    />
                  </div>
                  <Button onClick={handleSaveProfile} variant="default">
                    Save Changes
                  </Button>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{displayName}</h2>
                  <p className="text-muted-foreground">{email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="w-3 h-3 mr-1" />
                      Joined {userStats.joinDate}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-card border-border">
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{userStats.activeHabits}</p>
            <p className="text-sm text-muted-foreground">Active Habits</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardContent className="p-4 text-center">
            <Award className="w-8 h-8 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{userStats.longestStreak}</p>
            <p className="text-sm text-muted-foreground">Best Streak</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-habit-mind mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{userStats.totalRooms}</p>
            <p className="text-sm text-muted-foreground">Rooms Joined</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-lg font-bold text-warning">{userStats.completionRate}%</span>
            </div>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* My Rooms */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">My Rooms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {userRooms.map((room) => (
            <div key={room.id} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-foreground">{room.name}</h3>
                    {room.role === "creator" && (
                      <Crown className="w-4 h-4 text-warning" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {room.members} members • {room.role}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-foreground">
            <Bell className="w-5 h-5" />
            <span>Notification Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground">Nudge Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when friends send you motivation nudges
              </p>
            </div>
            <Switch
              checked={notifications.nudges}
              onCheckedChange={() => handleNotificationChange('nudges')}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground">Daily Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Receive daily reminders to complete your habits
              </p>
            </div>
            <Switch
              checked={notifications.dailyReminders}
              onCheckedChange={() => handleNotificationChange('dailyReminders')}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground">Weekly Reports</Label>
              <p className="text-sm text-muted-foreground">
                Get weekly progress summaries and insights
              </p>
            </div>
            <Switch
              checked={notifications.weeklyReports}
              onCheckedChange={() => handleNotificationChange('weeklyReports')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;