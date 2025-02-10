import { useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Contract } from '@/types/contract';
import type { User } from '@/types/user';

export function useDatabase() {
  const createUser = useCallback(async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email: userData.email,
          name: userData.name,
          role: userData.role,
          contractsRemaining: userData.role === 'free' ? 3 : null,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }, []);

  const createContract = useCallback(async (contractData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data, error } = await supabase
      .from('contracts')
      .insert([
        {
          title: contractData.title,
          content: contractData.content,
          highlights: contractData.highlights,
          changes: contractData.changes,
          status: contractData.status,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }, []);

  return {
    createUser,
    createContract,
  };
}
