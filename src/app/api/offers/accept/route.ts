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

    // Get offer details
    const { data: offer, error: offerError } = await supabase
      .from('offer')
      .select('buyer_id')
      .eq('id', offer_id)
      .single();

    if (offerError || !offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    // Call the sale transaction function
    const { error: saleError } = await supabase
      .rpc('accept_listing_transaction', {
        p_listing_id: listing_id,
        p_seller_id: user.id,
        p_buyer_id: offer.buyer_id,
        p_amount: amount,
        p_type: 'OFFER'
      });

    if (saleError) {
      throw saleError;
    }

    // Update offer status
    const { error: updateError } = await supabase
      .from('offer')
      .update({ status: 'ACCEPTED' })
      .eq('id', offer_id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Accept offer error:', error);
    return NextResponse.json(
      { error: 'Failed to accept offer' },
      { status: 500 }
    );
  }
} 