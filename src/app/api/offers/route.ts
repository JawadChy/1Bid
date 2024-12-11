import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const json = await request.json();
    const { listing_id, amount } = json;

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check user's wallet balance
    const { data: profile, error: profileError } = await supabase
      .from('profile')
      .select('wallet_bal')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Failed to fetch user balance' },
        { status: 500 }
      );
    }

    // Add wallet balance validation
    if (profile.wallet_bal < amount) {
      return NextResponse.json(
        { error: `Insufficient wallet balance. Your balance: $${profile.wallet_bal}` },
        { status: 400 }
      );
    }

    // Insert the offer
    const { data: offer, error: offerError } = await supabase
      .from('offer')
      .insert({
        listing_id,
        buyer_id: user.id,
        amount,
        status: 'PENDING'
      })
      .select()
      .single();

    if (offerError) {
      throw offerError;
    }

    return NextResponse.json({ data: offer });

  } catch (error) {
    console.error('Offer error:', error);
    return NextResponse.json(
      { error: 'Failed to process offer' },
      { status: 500 }
    );
  }
}
