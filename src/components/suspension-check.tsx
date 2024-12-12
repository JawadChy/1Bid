'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SuspendedUserView } from "./suspended-user-view";

interface SuspensionCheckProps {
  children: React.ReactNode;
}

export function SuspensionCheck({ children }: SuspensionCheckProps) {
  const [isSuspended, setIsSuspended] = useState(false);
  const [suspensionCount, setSuspensionCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkSuspension = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profile')
        .select('is_suspended, suspension_count')
        .eq('id', user.id)
        .single();

      if (profile) {
        setIsSuspended(profile.is_suspended);
        setSuspensionCount(profile.suspension_count);
        setUserId(user.id);
      }
    };

    checkSuspension();
  }, []);

  if (isSuspended && userId) {
    return <SuspendedUserView suspensionCount={suspensionCount} userId={userId} />;
  }

  return children;
} 