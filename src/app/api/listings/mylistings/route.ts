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

    const { data: listings, error } = await supabase
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

    // error handle
    // dont left join...
    if (error) {
      console.error('Error fetching listings:', error);
      return NextResponse.json(
        { error: "Failed to fetch listings" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      listings: listings || []
    });

  } catch (error) {
    console.error('Error in mylistings route:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}