import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  from_user_id: string;
  to_user_id: string;
  habit_id: string;
  message: string;
  read: boolean;
  created_at: string;
  from_user?: {
    display_name: string;
    avatar_url?: string;
  };
  habit?: {
    name: string;
  };
}

export interface Nudge {
  id: string;
  from_user_id: string;
  to_user_id: string;
  habit_id: string;
  created_at: string;
  to_user?: {
    display_name: string;
    avatar_url?: string;
  };
  from_user?: {
    display_name: string;
    avatar_url?: string;
  };
  habit?: {
    name: string;
  };
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [sentNudges, setSentNudges] = useState<Nudge[]>([]);
  const [receivedNudges, setReceivedNudges] = useState<Nudge[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch notifications
      const { data: notificationsData } = await supabase
        .from('notifications')
        .select(`
          *,
          from_user:profiles(display_name, avatar_url),
          habit:habits(name)
        `)
        .eq('to_user_id', user.id)
        .order('created_at', { ascending: false });

      if (notificationsData) {
        setNotifications(notificationsData as any);
      }

      // Fetch sent nudges
      const { data: sentNudgesData } = await supabase
        .from('nudges')
        .select(`
          *,
          to_user:profiles(display_name, avatar_url),
          habit:habits(name)
        `)
        .eq('from_user_id', user.id)
        .order('created_at', { ascending: false });

      if (sentNudgesData) {
        setSentNudges(sentNudgesData as any);
      }

      // Fetch received nudges
      const { data: receivedNudgesData } = await supabase
        .from('nudges')
        .select(`
          *,
          from_user:profiles(display_name, avatar_url),
          habit:habits(name)
        `)
        .eq('to_user_id', user.id)
        .order('created_at', { ascending: false });

      if (receivedNudgesData) {
        setReceivedNudges(receivedNudgesData as any);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendNudge = async (toUserId: string, habitId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if nudge was sent recently (within 60 minutes)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: recentNudge } = await supabase
        .from('nudges')
        .select('id')
        .eq('from_user_id', user.id)
        .eq('to_user_id', toUserId)
        .eq('habit_id', habitId)
        .gte('created_at', oneHourAgo)
        .limit(1);

      if (recentNudge && recentNudge.length > 0) {
        toast({
          title: "Hold On! ⏰",
          description: "You can only nudge once per hour per user",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('nudges')
        .insert({
          from_user_id: user.id,
          to_user_id: toUserId,
          habit_id: habitId
        });

      if (error) throw error;

      toast({
        title: "Nudge Sent! 👍",
        description: "Your buddy has been notified"
      });

      await fetchNotifications();
    } catch (error) {
      console.error('Error sending nudge:', error);
      toast({
        title: "Error",
        description: "Failed to send nudge",
        variant: "destructive"
      });
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Set up real-time subscriptions
    const notificationsChannel = supabase
      .channel('notifications-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications'
      }, () => {
        fetchNotifications();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'nudges'
      }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
    };
  }, []);

  return {
    notifications,
    sentNudges,
    receivedNudges,
    loading,
    sendNudge,
    markAsRead,
    refetch: fetchNotifications,
    unreadCount: notifications.filter(n => !n.read).length
  };
};