import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const json = await request.json();
    const { type, amount } = json;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Call the transaction handler
    const { data, error } = await supabase
      .rpc('handle_wallet_transaction', {
        p_user_id: user.id,
        p_type: type,
        p_amount: amount
      });

    if (error) {
      if (error.message === 'Insufficient balance') {
        return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
      }
      throw error;
    }

    // Check VIP status after transaction
    await supabase.rpc('check_vip_status', {
      profile_id: user.id
    });

    return NextResponse.json({ 
      balance: data[0].new_balance,
      message: `Successfully ${type === 'DEPOSIT' ? 'added' : 'withdrawn'} $${amount}`
    });

  } catch (error) {
    console.error('Transaction error:', error);
    return NextResponse.json(
      { error: 'Failed to process transaction' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get wallet balance from profile
    const { data: profile, error: profileError } = await supabase
      .from('profile')
      .select('wallet_bal')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw profileError;
    }

    // Get transactions but filter based on user's role in each transaction
    const { data: transactions, error: transactionError } = await supabase
      .from('transaction')
      .select(`
        id,
        type,
        amount,
        status,
        created_at,
        seller_id,
        buyer_id
      `)
      .or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (transactionError) {
      throw transactionError;
    }

    // Filter and transform transactions to show correct type based on user's role
    const filteredTransactions = transactions.map(transaction => {
      // If user is the seller, only show SALE transactions
      if (transaction.seller_id === user.id && transaction.type === 'SALE') {
        return transaction;
      }
      // If user is the buyer, only show PURCHASE transactions
      if (transaction.buyer_id === user.id && transaction.type === 'PURCHASE') {
        return transaction;
      }
      // For deposits and withdrawals, show as is
      if (transaction.type === 'DEPOSIT' || transaction.type === 'WITHDRAWAL') {
        return transaction;
      }
      return null;
    }).filter(Boolean); // Remove null entries

    return NextResponse.json({
      balance: profile.wallet_bal,
      transactions: filteredTransactions
    });

  } catch (error) {
    console.error('Error fetching wallet data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet data' },
      { status: 500 }
    );
  }
}