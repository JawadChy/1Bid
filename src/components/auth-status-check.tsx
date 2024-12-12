'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SuspendedUserView } from "./suspended-user-view";
import { usePathname } from 'next/navigation';
import BannedPage from '@/app/banned/page';

interface AuthStatusCheckProps {
  children: React.ReactNode;
}

export function AuthStatusCheck({ children }: AuthStatusCheckProps) {
  const [isSuspended, setIsSuspended] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [suspensionCount, setSuspensionCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: banData, error: banError } = await supabase
        .from('ban')
        .select('ban_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (banError) {
        console.error('Ban check error:', banError);
      }

      if (banData) {
        setIsBanned(true);
        return; // No need to check suspension if banned
      }

      // Check suspension status
      const { data: profile, error: profileError } = await supabase
        .from('profile')
        .select('is_suspended, suspension_count')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile check error:', profileError);
      }

      if (profile) {
        setIsSuspended(profile.is_suspended);
        setSuspensionCount(profile.suspension_count);
        setUserId(user.id);
      }
    };

    checkStatus();
  }, []);

  // Show ban page if user is banned
  if (isBanned) {
    return <BannedPage />;
  }

  // Show suspension page if user is suspended (except on wallet page)
  if (isSuspended && userId && pathname !== '/wallet') {
    return <SuspendedUserView suspensionCount={suspensionCount} userId={userId} />;
  }

  return children;
} 