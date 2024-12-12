import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { offer_id, listing_id, amount } = await request.json();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get offer details and check if buyer is VIP
    const { data: offer, error: offerError } = await supabase
      .from('offer')
      .select(`
        buyer_id,
        buyer:profile!offer_buyer_id_fkey (
          is_vip
        )
      `)
      .eq('id', offer_id)
      .single();

    if (offerError || !offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    // Apply VIP discount if applicable
    const finalAmount = offer.buyer.is_vip ? amount * 0.9 : amount;

    // Call the sale transaction function
    const { error: saleError } = await supabase
      .rpc('accept_listing_transaction', {
        p_listing_id: listing_id,
        p_seller_id: user.id,
        p_buyer_id: offer.buyer_id,
        p_amount: finalAmount,
        p_type: 'OFFER',
        p_offer_bid_id: offer_id
      });

    if (saleError) {
      if (saleError.message.includes('Insufficient funds')) {
        return NextResponse.json({ error: 'Buyer has insufficient funds' }, { status: 400 });
      }
      throw saleError;
    }

    // Check VIP status after transaction
    await supabase.rpc('check_vip_status', {
      profile_id: offer.buyer_id
    });
    await supabase.rpc('check_vip_status', {
      profile_id: user.id
    });

    return NextResponse.json({ 
      success: true,
      discounted: offer.buyer.is_vip,
      finalAmount
    });

  } catch (error) {
    console.error('Accept offer error:', error);
    return NextResponse.json(
      { error: 'Failed to accept offer' },
      { status: 500 }
    );
  }
} 