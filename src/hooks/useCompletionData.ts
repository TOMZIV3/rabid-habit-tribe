import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';

export const useCompletionData = () => {
  const [completionData, setCompletionData] = useState<Record<string, number>>({});

  const fetchCompletionData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's rooms
      const { data: roomMembers } = await supabase
        .from('room_members')
        .select('room_id')
        .eq('user_id', user.id);

      if (!roomMembers?.length) {
        setCompletionData({});
        return;
      }

      const roomIds = roomMembers.map(rm => rm.room_id);

      // Generate last 8 days (7 previous + today)
      const days = [];
      for (let i = 7; i >= 0; i--) {
        days.push(format(subDays(new Date(), i), 'yyyy-MM-dd'));
      }

      const data: Record<string, number> = {};

      // For each day, calculate completion percentage
      for (const day of days) {
        // Get habits for that existed on that day
        const { data: habits } = await supabase
          .from('habits')
          .select('id, target_count, room_id')
          .in('room_id', roomIds)
          .lte('created_at', `${day}T23:59:59.999Z`);

        if (!habits?.length) {
          data[day] = 0;
          continue;
        }

        // Get all memberships for these habits
        const habitIds = habits.map(h => h.id);
        const { data: memberships } = await supabase
          .from('habit_memberships')
          .select('habit_id, user_id')
          .in('habit_id', habitIds)
          .lte('joined_at', `${day}T23:59:59.999Z`);

        if (!memberships?.length) {
          data[day] = 0;
          continue;
        }

        // Get completions for that day
        const { data: completions } = await supabase
          .from('habit_completions')
          .select('habit_id, user_id')
          .in('habit_id', habitIds)
          .eq('completion_date', day);

        // Calculate completion percentage
        let totalCompletions = 0;
        let totalPossible = 0;

        for (const habit of habits) {
          const habitMemberships = memberships.filter(m => m.habit_id === habit.id);
          const habitCompletions = completions?.filter(c => c.habit_id === habit.id) || [];
          
          // Group completions by user
          const userCompletions = habitCompletions.reduce((acc, comp) => {
            acc[comp.user_id] = (acc[comp.user_id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          for (const membership of habitMemberships) {
            const userCompletionCount = userCompletions[membership.user_id] || 0;
            totalCompletions += Math.min(userCompletionCount, habit.target_count);
            totalPossible += habit.target_count;
          }
        }

        data[day] = totalPossible > 0 ? (totalCompletions / totalPossible) * 100 : 0;
      }

      setCompletionData(data);
    } catch (error) {
      console.error('Error fetching completion data:', error);
    }
  };

  useEffect(() => {
    fetchCompletionData();

    // Set up real-time subscriptions
    const channel = supabase
      .channel('completion-data-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'habit_completions'
      }, () => {
        fetchCompletionData();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'habit_memberships'
      }, () => {
        fetchCompletionData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { completionData, refetch: fetchCompletionData };
};