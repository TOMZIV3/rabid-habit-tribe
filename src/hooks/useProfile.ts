import { useState, useEffect } from 'react';
import { supabase, withRetry, validateSession, isOnline } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setProfile(data);
      } else {
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User'
          })
          .select()
          .single();

        if (createError) throw createError;
        setProfile(newProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    // Check network connectivity
    if (!isOnline()) {
      toast({
        title: "No Internet Connection",
        description: "Please check your internet connection and try again",
        variant: "destructive"
      });
      return;
    }

    // Validate session
    const sessionValid = await validateSession();
    if (!sessionValid) {
      toast({
        title: "Authentication Error",
        description: "Please log out and log back in",
        variant: "destructive"
      });
      return;
    }

    if (!profile) {
      toast({
        title: "Error",
        description: "Profile not loaded yet",
        variant: "destructive"
      });
      return;
    }

    setUpdating(true);
    try {
      await withRetry(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw new Error(`Update failed: ${error.message}`);

        setProfile(data);
        toast({
          title: "Profile Updated! ✨",
          description: "Your changes have been saved"
        });
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      
      let errorMessage = "Failed to update profile";
      if (error.message?.includes('fetch')) {
        errorMessage = "Network error - please try again";
      } else if (error.message?.includes('auth')) {
        errorMessage = "Authentication error - please log in again";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    updating,
    updateProfile,
    refetch: fetchProfile
  };
};