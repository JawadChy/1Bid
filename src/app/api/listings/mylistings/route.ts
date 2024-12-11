import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get listings where user is seller
    const { data: sellerListings, error: sellerError } = await supabase
      .from('listing')
      .select(`
        *,
        listing_image (
          public_url
        ),
        bid_listing (
          starting_price,
          curr_bid_amt,
          end_time
        ),
        buy_now_listing (
          asking_price
        )
      `)
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    // Get listings where user is buyer
    const { data: purchasedListings, error: buyerError } = await supabase
      .from('listing')
      .select(`
        *,
        listing_image (
          public_url
        ),
        bid_listing (
          starting_price,
          curr_bid_amt,
          end_time
        ),
        buy_now_listing (
          asking_price
        )
      `)
      .eq('status', 'SOLD')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false });

    if (sellerError || buyerError) {
      console.error('Error fetching listings:', sellerError || buyerError);
      return NextResponse.json(
        { error: "Failed to fetch listings" },
        { status: 500 }
      );
    }

    // Combine and mark purchased listings
    const purchasedWithStatus = purchasedListings?.map(listing => ({
      ...listing,
      status: 'PURCHASED'
    })) || [];

    return NextResponse.json({
      listings: [...(sellerListings || []), ...purchasedWithStatus]
    });

  } catch (error) {
    console.error('Error in mylistings route:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}