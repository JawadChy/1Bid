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

    // Get bid details and check if buyer is VIP
    const { data: bid, error: bidError } = await supabase
      .from('bid')
      .select(`
        bidder_id,
        bidder:profile!bid_bidder_id_fkey (
          is_vip
        )
      `)
      .eq('id', bid_id)
      .single();

    if (bidError || !bid) {
      return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
    }

    // Apply VIP discount if applicable
    const finalAmount = bid.bidder.is_vip ? amount * 0.9 : amount;

    // Call the stored procedure with discounted amount
    const { error: saleError } = await supabase
      .rpc('accept_listing_transaction', {
        p_listing_id: listing_id,
        p_seller_id: user.id,
        p_buyer_id: bid.bidder_id,
        p_amount: finalAmount,
        p_type: 'BID'
      });

    if (saleError) {
      if (saleError.message.includes('Insufficient funds')) {
        return NextResponse.json({ error: 'Buyer has insufficient funds' }, { status: 400 });
      }
      throw saleError;
    }

    // Check VIP status after transaction
    await supabase.rpc('check_vip_status', {
      profile_id: bid.bidder_id
    });
    await supabase.rpc('check_vip_status', {
      profile_id: user.id
    });

    return NextResponse.json({ 
      success: true,
      discounted: bid.bidder.is_vip,
      finalAmount
    });

  } catch (error) {
    console.error('Accept bid error:', error);
    return NextResponse.json(
      { error: 'Failed to accept bid' },
      { status: 500 }
    );
  }
} 