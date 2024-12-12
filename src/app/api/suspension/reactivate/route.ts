import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Handle wallet transaction first
    const { data: walletData, error: walletError } = await supabase
      .rpc('handle_wallet_transaction', {
        p_user_id: user.id,
        p_type: 'WITHDRAWAL',
        p_amount: 50
      });

    if (walletError) {
      if (walletError.message.includes('Insufficient balance')) {
        return NextResponse.json(
          { error: 'Insufficient balance' }, 
          { status: 400 }
        );
      }
      throw walletError;
    }

    // If payment successful, update profile status
    const { error: profileError } = await supabase
      .from('profile')
      .update({
        is_suspended: false,
        account_status: 'ACTIVE'
      })
      .eq('id', user.id);

    if (profileError) throw profileError;

    return NextResponse.json({ 
      success: true,
      new_balance: walletData?.[0]?.new_balance 
    });

  } catch (error) {
    console.error('Reactivation error:', error);
    return NextResponse.json(
      { error: 'Failed to reactivate account' },
      { status: 500 }
    );
  }
} 