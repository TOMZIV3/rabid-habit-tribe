import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Room {
  id: string;
  name: string;
  inviteCode: string;
  createdBy: string;
  memberCount: number;
  isCreator: boolean;
  members: RoomMember[];
}

export interface RoomMember {
  id: string;
  displayName: string;
  avatarUrl?: string;
  joinedAt: string;
}

export const useRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRooms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's rooms
      const { data: roomMemberships } = await supabase
        .from('room_members')
        .select(`
          room_id,
          joined_at,
          rooms!inner(
            id,
            name,
            invite_code,
            created_by
          )
        `)
        .eq('user_id', user.id);

      if (!roomMemberships?.length) {
        setRooms([]);
        setCurrentRoom(null);
        setLoading(false);
        return;
      }

      // Get member details for each room
      const roomsWithMembers = await Promise.all(
        roomMemberships.map(async (membership) => {
          const room = membership.rooms;
          
          // Get all members for this room
          const { data: members } = await supabase
            .from('room_members')
            .select(`
              user_id,
              joined_at
            `)
            .eq('room_id', room.id);

          // Get profiles for members
          const memberIds = members?.map(m => m.user_id) || [];
          const { data: profiles } = memberIds.length > 0 ? await supabase
            .from('profiles')
            .select('user_id, display_name, avatar_url')
            .in('user_id', memberIds) : { data: [] };

          const roomMembers: RoomMember[] = (members || []).map(member => {
            const profile = profiles?.find(p => p.user_id === member.user_id);
            return {
              id: member.user_id,
              displayName: profile?.display_name || 'Anonymous',
              avatarUrl: profile?.avatar_url,
              joinedAt: member.joined_at
            };
          });

          return {
            id: room.id,
            name: room.name,
            inviteCode: room.invite_code,
            createdBy: room.created_by,
            memberCount: roomMembers.length,
            isCreator: room.created_by === user.id,
            members: roomMembers
          };
        })
      );

      setRooms(roomsWithMembers);
      
      // Set current room to first one if none selected
      if (!currentRoom && roomsWithMembers.length > 0) {
        setCurrentRoom(roomsWithMembers[0]);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast({
        title: "Error",
        description: "Failed to load rooms",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async (name: string) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('User auth error:', userError);
        throw userError;
      }
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Creating room for user:', user.id);

      // Generate a unique invite code
      const inviteCode = generateInviteCode();
      console.log('Generated invite code:', inviteCode);

      // Create room with explicit error handling
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          name: name.trim(),
          created_by: user.id,
          invite_code: inviteCode
        })
        .select()
        .single();

      if (roomError) {
        console.error('Room creation error:', roomError);
        throw roomError;
      }

      console.log('Room created successfully:', room);

      // Join the room as creator
      const { error: memberError } = await supabase
        .from('room_members')
        .insert({
          room_id: room.id,
          user_id: user.id
        });

      if (memberError) {
        console.error('Member insertion error:', memberError);
        throw memberError;
      }

      console.log('User added to room as creator');

      toast({
        title: "Room Created! 🎉",
        description: `${name} is ready for habit tracking`
      });

      // Refetch rooms to update state
      await fetchRooms();
      return room;
    } catch (error: any) {
      console.error('Error creating room:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create room",
        variant: "destructive"
      });
      return null;
    }
  };

  const joinRoom = async (inviteCode: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Find room by invite code using the debug function first to verify
      const { data: debugResult } = await supabase
        .rpc('debug_room_lookup', { code: inviteCode.trim().toUpperCase() });

      console.log('Debug room lookup result:', debugResult);

      // Find room by invite code with better error handling
      const cleanCode = inviteCode.trim().toUpperCase();
      console.log('Searching for room with invite code:', cleanCode);
      
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('id, name')
        .ilike('invite_code', cleanCode)
        .maybeSingle();

      if (roomError) {
        console.error('Room lookup error:', roomError);
        toast({
          title: "Database Error",
          description: `Error looking up room: ${roomError.message}`,
          variant: "destructive"
        });
        return false;
      }

      if (!room) {
        toast({
          title: "Invalid Code",
          description: `Room not found with invite code: ${inviteCode.trim().toUpperCase()}`,
          variant: "destructive"
        });
        return false;
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('room_members')
        .select('id')
        .eq('room_id', room.id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        toast({
          title: "Already Joined",
          description: "You're already a member of this room",
          variant: "destructive"
        });
        return false;
      }

      // Check member limit (max 3)
      const { data: existingMembers } = await supabase
        .from('room_members')
        .select('id')
        .eq('room_id', room.id);
      
      const memberCount = existingMembers?.length || 0;

      if (memberCount >= 3) {
        toast({
          title: "Room Full",
          description: "This room already has 3 members",
          variant: "destructive"
        });
        return false;
      }

      // Join room
      const { error: joinError } = await supabase
        .from('room_members')
        .insert({
          room_id: room.id,
          user_id: user.id
        });

      if (joinError) throw joinError;

      toast({
        title: "Joined Room! 🎉",
        description: `Welcome to ${room.name}`
      });

      await fetchRooms();
      return true;
    } catch (error) {
      console.error('Error joining room:', error);
      toast({
        title: "Error",
        description: "Failed to join room",
        variant: "destructive"
      });
      return false;
    }
  };

  const leaveRoom = async (roomId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('room_members')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Left Room",
        description: "You've left the room"
      });

      await fetchRooms();
    } catch (error) {
      console.error('Error leaving room:', error);
      toast({
        title: "Error",
        description: "Failed to leave room",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchRooms();

    // Set up real-time subscriptions
    const roomsChannel = supabase
      .channel('rooms-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'room_members'
      }, () => {
        fetchRooms();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rooms'
      }, () => {
        fetchRooms();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(roomsChannel);
    };
  }, []);

  return {
    rooms,
    currentRoom,
    setCurrentRoom,
    loading,
    createRoom,
    joinRoom,
    leaveRoom,
    refetch: fetchRooms
  };
};

const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // Exclude confusing chars (0, O, 1, I, l)
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};