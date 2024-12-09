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

    const [activeResponse, soldResponse, purchasedResponse] = await Promise.all([
      // active
      supabase
        .from('listing')
        .select(`
          *,
          listing_image (public_url, position),
          bid_listing (*),
          buy_now_listing (*)
        `)
        .eq('seller_id', user.id)
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false }),

      // sold
      supabase
        .from('transaction')
        .select(`
          *,
          listing:listing_id (
            *,
            listing_image (public_url, position),
            bid_listing (*),
            buy_now_listing (*)
          )
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false }),

      // pruchased
      supabase
        .from('transaction')
        .select(`
          *,
          listing:listing_id (
            *,
            listing_image (public_url, position),
            bid_listing (*),
            buy_now_listing (*)
          )
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })
    ]);

    // error handle
    // dont left join...
    if (activeResponse.error) {
      console.error('Error fetching active listings:', activeResponse.error);
      return NextResponse.json(
        { error: "Failed to fetch active listings" },
        { status: 500 }
      );
    }

    if (soldResponse.error) {
      console.error('Error fetching sold listings:', soldResponse.error);
      return NextResponse.json(
        { error: "Failed to fetch sold listings" },
        { status: 500 }
      );
    }

    if (purchasedResponse.error) {
      console.error('Error fetching purchased listings:', purchasedResponse.error);
      return NextResponse.json(
        { error: "Failed to fetch purchased listings" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      activeListings: activeResponse.data || [],
      soldListings: soldResponse.data || [],
      purchasedListings: purchasedResponse.data || []
    });

  } catch (error) {
    console.error('Error in mylistings route:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}