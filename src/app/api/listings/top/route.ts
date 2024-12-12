import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  
  try {
    const { data: listings, error } = await supabase
      .from('listing')
      .select(`
        *,
        listing_image!inner (
          public_url
        ),
        bid_listing!inner (
          id,
          starting_price,
          end_time,
          curr_bid_amt,
          curr_bid_id,
          min_bid_increment
        ),
        bid_count:bid!bid_listing(count)
      `)
      .eq('status', 'ACTIVE')
      .eq('listing_type', 'BID')
      .eq('listing_image.position', 1)
      .gt('bid_listing.end_time', new Date().toISOString()) 
      .order('curr_bid_amt', { foreignTable: 'bid_listing', ascending: false })
      .limit(6);

    if (error) throw error;

    const processedListings = listings?.map((listing: any) => ({
      ...listing,
      price: listing.bid_listing[0]?.curr_bid_amt || listing.bid_listing[0]?.starting_price,
      imageUrl: listing.listing_image.public_url,
      end_time: listing.bid_listing[0]?.end_time,
      curr_bid_amt: listing.bid_listing[0]?.curr_bid_amt,
      min_bid_increment: listing.bid_listing[0]?.min_bid_increment,
      bid_count: listing.bid_count?.[0]?.count || 0
    }));

    return NextResponse.json({ listings: processedListings });
    
  } catch (error) {
    console.error('Error fetching top auction items:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch top auction items' },
      { status: 500 }
    );
  }
} 