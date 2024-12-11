import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface Rating {
  rating: number;
  rated_id: string;
  rater_id: string;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing listing ID' }, { status: 400 });
    }

    // curr user
    const { data: { user } } = await supabase.auth.getUser();

    const { data: listing, error } = await supabase
      .from('listing')
      .select(`
        *,
        bid_listing (
          starting_price,
          end_time,
          curr_bid_amt,
          min_bid_increment
        ),
        buy_now_listing (
          asking_price,
          min_offer_price
        ),
        listing_image!inner (
          public_url
        ),
        rating!listing_id (
          rating,
          rater_id,
          rated_id
        )
      `)
      .eq('id', id)
      .eq('listing_image.position', 1)
      .single();

    if (error) {
      throw error;
    }

    let processedListing = { ...listing };

    // getting price based on listing type
    if (listing.listing_type === 'BID') {
      processedListing.price = listing.bid_listing?.[0]?.curr_bid_amt || listing.bid_listing?.[0]?.starting_price;
      processedListing.min_bid_increment = listing.bid_listing?.[0]?.min_bid_increment;
      processedListing.end_time = listing.bid_listing?.[0]?.end_time;
    } else {
      processedListing.price = listing.buy_now_listing?.[0]?.asking_price;
      processedListing.min_offer_price = listing.buy_now_listing?.[0]?.min_offer_price;
    }

    // Add the image URL
    processedListing.imageUrl = listing.listing_image[0].public_url;

    // Process ratings if the listing is sold
    if (listing.status === 'SOLD' && listing.rating) {
      const ratings = listing.rating;
      processedListing.seller_rating = ratings.find(
        (r: Rating) => r.rated_id === listing.seller_id
      )?.rating;
      processedListing.buyer_rating = ratings.find(
        (r: Rating) => r.rated_id === listing.buyer_id
      )?.rating;
    }

    // Add isOwner flag
    processedListing.isOwner = user?.id === listing.seller_id;

    return NextResponse.json({ listing: processedListing });

  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listing' },
      { status: 500 }
    );
  }
}
