import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface House {
  id: string;
  name: string;
  description: string | null;
  rules: string | null;
  invite_code: string;
  created_by: string;
}

export function useHouse() {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createHouse = async (name: string, description?: string, rules?: string) => {
    if (!user) {
      setError('You must be logged in to create a house');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Generate invite code using the database function
      const { data: inviteCode, error: codeError } = await supabase.rpc('generate_invite_code');
      
      if (codeError) {
        throw codeError;
      }

      // Create the house
      const { data: house, error: houseError } = await supabase
        .from('houses')
        .insert({
          name,
          description: description || null,
          rules: rules || null,
          invite_code: inviteCode,
          created_by: user.id,
        })
        .select()
        .single();

      if (houseError) {
        throw houseError;
      }

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('house_members')
        .insert({
          house_id: house.id,
          user_id: user.id,
          role: 'admin',
        });

      if (memberError) {
        throw memberError;
      }

      // Update user's current house
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ current_house_id: house.id })
        .eq('id', user.id);

      if (profileError) {
        throw profileError;
      }

      await refreshProfile();
      return house as House;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create house';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const joinHouse = async (inviteCode: string) => {
    if (!user) {
      setError('You must be logged in to join a house');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Find the house with this invite code
      const { data: house, error: houseError } = await supabase
        .from('houses')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase().trim())
        .single();

      if (houseError || !house) {
        throw new Error('Invalid invite code. Please check and try again.');
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('house_members')
        .select('id')
        .eq('house_id', house.id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        // User is already a member, just update current house
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ current_house_id: house.id })
          .eq('id', user.id);

        if (profileError) throw profileError;
        
        await refreshProfile();
        return house as House;
      }

      // Add user as member
      const { error: memberError } = await supabase
        .from('house_members')
        .insert({
          house_id: house.id,
          user_id: user.id,
          role: 'member',
        });

      if (memberError) {
        throw memberError;
      }

      // Update user's current house
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ current_house_id: house.id })
        .eq('id', user.id);

      if (profileError) {
        throw profileError;
      }

      await refreshProfile();
      return house as House;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join house';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createHouse,
    joinHouse,
    loading,
    error,
  };
}
