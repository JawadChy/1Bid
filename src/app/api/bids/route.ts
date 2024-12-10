import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

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

    // Fetch the listing with bid_listing details
    const { data: listing, error: listingError } = await supabase
      .from('listing')
      .select(`
        *,
        bid_listing!inner(
          starting_price,
          curr_bid_amt,
          min_bid_increment,
          end_time
        )
      `)
      .eq('id', listing_id)
      .single();

    if (listingError || !listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Prevent owner from bidding on their own listing
    if (user.id === listing.seller_id) {
      return NextResponse.json(
        { error: 'Cannot bid on your own listing' },
        { status: 400 }
      );
    }

    const currentBid = listing.bid_listing.curr_bid_amt || listing.bid_listing.starting_price;
    const minBidRequired = currentBid + listing.bid_listing.min_bid_increment;

    // Validate bid amount
    if (amount <= currentBid) {
      return NextResponse.json(
        { error: 'Bid must be greater than current bid' },
        { status: 400 }
      );
    }

    if (amount < minBidRequired) {
      return NextResponse.json(
        { error: `Bid must be at least ${minBidRequired}` },
        { status: 400 }
      );
    }

    // Check if auction has ended
    if (listing.bid_listing.end_time && new Date(listing.bid_listing.end_time) < new Date()) {
      return NextResponse.json(
        { error: 'Auction has ended' },
        { status: 400 }
      );
    }

    // Insert the bid
    const { data: bid, error: bidError } = await supabase
      .from('bid')
      .insert({
        listing_id,
        bidder_id: user.id,
        amount,
        status: 'PENDING'
      })
      .select()
      .single();

    if (bidError) {
      throw bidError;
    }

    // Update bid_listing's current bid amount
    const { error: updateError } = await supabase
      .from('bid_listing')
      .update({ 
        curr_bid_amt: amount
      })
      .eq('listing_id', listing_id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ data: bid });

  } catch (error) {
    console.error('Bid error:', error);
    return NextResponse.json(
      { error: 'Failed to process bid' },
      { status: 500 }
    );
  }
}