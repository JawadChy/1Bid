import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { bid_id, listing_id, amount } = await request.json();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get bid details
    const { data: bid, error: bidError } = await supabase
      .from('bid')
      .select('bidder_id')
      .eq('id', bid_id)
      .single();

    if (bidError || !bid) {
      return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
    }

    // Call the stored procedure
    const { error: saleError } = await supabase
      .rpc('accept_listing_transaction', {
        p_listing_id: listing_id,
        p_seller_id: user.id,
        p_buyer_id: bid.bidder_id,
        p_amount: amount,
        p_type: 'BID'
      });

    if (saleError) {
      if (saleError.message.includes('Insufficient funds')) {
        return NextResponse.json({ error: 'Buyer has insufficient funds' }, { status: 400 });
      }
      if (saleError.message.includes('already sold')) {
        return NextResponse.json({ error: 'Listing is already sold' }, { status: 400 });
      }
      throw saleError;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Accept bid error:', error);
    return NextResponse.json(
      { error: 'Failed to accept bid' },
      { status: 500 }
    );
  }
} 