import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { listing_id, rating, rated_id } = await request.json();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get listing details to verify buyer/seller
    const { data: listing, error: listingError } = await supabase
      .from('listing')
      .select('seller_id, buyer_id, status')
      .eq('id', listing_id)
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Verify the listing is sold
    if (listing.status !== 'SOLD') {
      return NextResponse.json(
        { error: 'Can only rate completed transactions' },
        { status: 400 }
      );
    }

    // Verify the user is either buyer or seller
    if (user.id !== listing.buyer_id && user.id !== listing.seller_id) {
      return NextResponse.json(
        { error: 'Only buyer and seller can rate' },
        { status: 403 }
      );
    }

    // Check if user has already rated
    const { data: existingRating } = await supabase
      .from('rating')
      .select('id')
      .eq('listing_id', listing_id)
      .eq('rater_id', user.id)
      .single();

    if (existingRating) {
      return NextResponse.json(
        { error: 'You have already submitted a rating' },
        { status: 400 }
      );
    }

    // Insert the rating
    const { error } = await supabase
      .from('rating')
      .insert({
        listing_id,
        rater_id: user.id,
        rated_id: user.id === listing.buyer_id ? listing.seller_id : listing.buyer_id,
        rating
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Rating error:', error);
    return NextResponse.json(
      { error: 'Failed to submit rating' },
      { status: 500 }
    );
  }
} 