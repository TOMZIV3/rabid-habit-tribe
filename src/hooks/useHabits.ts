import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface HabitMember {
  id: string;
  displayName: string;
  completions: number;
  targetCount: number;
  avatarUrl?: string;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: "mind" | "health" | "home" | "errands";
  habitType: "daily" | "weekly";
  targetCount: number;
  members: HabitMember[];
  isJoined: boolean;
  isCreator: boolean;
  roomId: string;
}

export const useHabits = (selectedDate?: Date) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchHabits = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Auth error in fetchHabits:', userError);
        return;
      }
      if (!user) {
        console.log('No user found in fetchHabits');
        return;
      }

      // Get user's rooms first
      const { data: roomMembers } = await supabase
        .from('room_members')
        .select('room_id')
        .eq('user_id', user.id);

      if (!roomMembers?.length) {
        setHabits([]);
        setLoading(false);
        return;
      }

      const roomIds = roomMembers.map(rm => rm.room_id);

      // Fetch habits from user's rooms
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select(`
          id,
          name,
          description,
          category,
          habit_type,
          target_count,
          created_by,
          room_id
        `)
        .in('room_id', roomIds);

      if (habitsError) throw habitsError;

      // For each habit, get memberships and completions
      const habitsWithMembers = await Promise.all(
        (habitsData || []).map(async (habit) => {
          // Get habit memberships
          const { data: memberships } = await supabase
            .from('habit_memberships')
            .select(`
              user_id
            `)
            .eq('habit_id', habit.id);

          // Get profiles for members
          const memberIds = memberships?.map(m => m.user_id) || [];
          const { data: profiles } = memberIds.length > 0 ? await supabase
            .from('profiles')
            .select('user_id, display_name, avatar_url')
            .in('user_id', memberIds) : { data: [] };

          // Get completions for the selected date (default to today)
          const targetDate = selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
          const { data: completions } = await supabase
            .from('habit_completions')
            .select('user_id')
            .eq('habit_id', habit.id)
            .eq('completion_date', targetDate);

          const completionCounts = completions?.reduce((acc, comp) => {
            acc[comp.user_id] = (acc[comp.user_id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>) || {};

          const members: HabitMember[] = (memberships || []).map(membership => {
            const profile = profiles?.find(p => p.user_id === membership.user_id);
            return {
              id: membership.user_id,
              displayName: profile?.display_name || 'Anonymous',
              completions: completionCounts[membership.user_id] || 0,
              targetCount: habit.target_count,
              avatarUrl: profile?.avatar_url
            };
          });

          const isJoined = memberships?.some(m => m.user_id === user.id) || false;
          const isCreator = habit.created_by === user.id;

          return {
            id: habit.id,
            name: habit.name,
            description: habit.description,
            category: habit.category as "mind" | "health" | "home" | "errands",
            habitType: habit.habit_type as "daily" | "weekly",
            targetCount: habit.target_count,
            members,
            isJoined,
            isCreator,
            roomId: habit.room_id
          };
        })
      );

      setHabits(habitsWithMembers);
    } catch (error) {
      console.error('Error fetching habits:', error);
      toast({
        title: "Error",
        description: "Failed to load habits",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const joinHabit = async (habitId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('habit_memberships')
        .insert({ habit_id: habitId, user_id: user.id });

      if (error) throw error;

      toast({
        title: "Success! 🎉",
        description: "You've joined the habit"
      });

      await fetchHabits(); // Refresh data
    } catch (error) {
      console.error('Error joining habit:', error);
      toast({
        title: "Error",
        description: "Failed to join habit",
        variant: "destructive"
      });
    }
  };

  const leaveHabit = async (habitId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('habit_memberships')
        .delete()
        .eq('habit_id', habitId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Left habit",
        description: "You've left the habit"
      });

      await fetchHabits(); // Refresh data
    } catch (error) {
      console.error('Error leaving habit:', error);
      toast({
        title: "Error",
        description: "Failed to leave habit",
        variant: "destructive"
      });
    }
  };

  const completeHabit = async (habitId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('habit_completions')
        .insert({ 
          habit_id: habitId, 
          user_id: user.id,
          completion_date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      toast({
        title: "Great job! 🎉",
        description: "Habit completed for today"
      });

      await fetchHabits(); // Refresh data
    } catch (error) {
      console.error('Error completing habit:', error);
      toast({
        title: "Error",
        description: "Failed to record completion",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchHabits();

    // Set up real-time subscriptions
    const habitsChannel = supabase
      .channel('habits-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'habit_completions'
      }, () => {
        fetchHabits();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'habit_memberships'
      }, () => {
        fetchHabits();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(habitsChannel);
    };
  }, [selectedDate]);

  return {
    habits,
    loading,
    joinHabit,
    leaveHabit,
    completeHabit,
    refetch: fetchHabits
  };
};