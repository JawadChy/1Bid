'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface SuspendedUserViewProps {
  suspensionCount: number;
  userId: string;
}

export function SuspendedUserView({ suspensionCount, userId }: SuspendedUserViewProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleReactivation = async () => {
    setLoading(true);
    try {
      // Check wallet balance
      const { data: profile } = await supabase
        .from('profile')
        .select('wallet_bal')
        .eq('id', userId)
        .single();

      if (!profile || profile.wallet_bal < 50) {
        router.push('/wallet');
        return;
      }

      // Process reactivation payment
      const response = await fetch('/api/suspension/reactivate', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to reactivate account');
      }

      toast.success('Account reactivated successfully');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to reactivate account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
      <div className="max-w-md w-full space-y-8 p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Account Suspended</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Suspension Count: {suspensionCount}
          </p>
        </div>
        <Button
          onClick={handleReactivation}
          className="w-full"
          disabled={loading}
        >
          {loading ? "Processing..." : "Pay $50 to Reactivate Account"}
        </Button>
      </div>
    </div>
  );
} 