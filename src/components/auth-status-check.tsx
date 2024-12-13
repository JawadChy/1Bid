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
  const [status, setStatus] = useState<'loading' | 'banned' | 'suspended' | 'active'>('loading');
  const [suspensionCount, setSuspensionCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStatus('active');
        return;
      }

      try {
        // Check both ban and suspension status simultaneously
        const [banResponse, profileResponse] = await Promise.all([
          supabase
            .from('ban')
            .select('ban_id')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('profile')
            .select('is_suspended, suspension_count')
            .eq('id', user.id)
            .single()
        ]);

        if (banResponse.data) {
          setStatus('banned');
          return;
        }

        if (profileResponse.data?.is_suspended) {
          setStatus('suspended');
          setSuspensionCount(profileResponse.data.suspension_count);
          setUserId(user.id);
        } else {
          setStatus('active');
        }
      } catch (error) {
        console.error('Status check error:', error);
        setStatus('active'); // Fallback to active on error
      }
    };

    checkStatus();
  }, []);

  if (status === 'loading') {
    return null; // Or loading spinner
  }

  if (status === 'banned') {
    return <BannedPage />;
  }

  if (status === 'suspended' && pathname !== '/wallet') {
    return <SuspendedUserView suspensionCount={suspensionCount} userId={userId} />;
  }

  return children;
} 