// api/comments?listing_id=<listing_id_value>

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the listing_id from parameters
    const listingId = request.nextUrl.searchParams.get("listing_id");
    // If the listingID is missing from GET request
    if (!listingId) {
      return NextResponse.json(
        { error: "Listing ID is required" },
        { status: 400 }
      );
    }

    // Call the function get_comments_by_listing
    // Details are hidden but it matches all comments with listing_id and sorts from newest to oldest
    const { data, error } = await supabase.rpc("get_comments_by_listing", {
      p_listing_id: listingId,
    });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch comments" }, {
        status: 500
      });
    }

    // Return the table data directly
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Internal server error" }, {
      status: 500
    });
  }
}

/* Returns data as
[
  {
    "id": "",
    "listing_id": "",
    "user_id": null,
    "content": "",
    "created_at": "",
    "updated_at": "",
    "visitor_id": "",
    "is_visitor": false
  },
  {
    "id": "",
    "listing_id": "",
    "user_id": null,
    "content": "",
    "created_at": "",
    "updated_at": "",
    "visitor_id": "",
    "is_visitor": false
  }
]
*/