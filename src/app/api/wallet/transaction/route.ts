import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // not gonna make new table bc im lazy so just using txns table, get all row where user is either buyer or seller
    const { data: transactions, error: txError } = await supabase
      .from('transaction')
      .select('*')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (txError) {
      console.error('Transaction fetch error:', txError);
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }

    // calc balance
    const balance = transactions?.reduce((acc, tx) => {
      if (tx.buyer_id === user.id) {
        return acc - (tx.amount || 0);
      }
      if (tx.seller_id === user.id) {
        return acc + (tx.amount || 0);
      }
      return acc;
    }, 0) || 0;

    return NextResponse.json({ balance, transactions });
  } catch (error) {
    console.error('Error in GET handler:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, amount } = await request.json();

    if (!type || !amount || isNaN(Number(amount))) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // to withdraw check bal first to see if enough moniez
    if (type === 'WITHDRAWAL') {
      const { data: transactions } = await supabase
        .from('transaction')
        .select('*')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
      
      const currentBalance = transactions?.reduce((acc, tx) => {
        if (tx.buyer_id === user.id) return acc - (tx.amount || 0);
        if (tx.seller_id === user.id) return acc + (tx.amount || 0);
        return acc;
      }, 0) || 0;
      
      if (currentBalance < amount) {
        return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
      }
    }

    // add actual transaction to table
    const { data: transaction, error: txError } = await supabase
      .from('transaction')
      .insert([{
        type,
        amount: Math.abs(amount),
        status: 'completed',
        buyer_id: type === 'WITHDRAWAL' ? user.id : null,
        seller_id: type === 'DEPOSIT' ? user.id : null,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (txError) {
      console.error('Transaction creation error:', txError);
      return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}