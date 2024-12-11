// GET /api/view/frequentview
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient(); 

    // Retrieve the session 
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Check if a valid session exists
    if (!session || !session.user) {
      // If no valid session, return an error
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 400 });
    }

    // Extract user_id 
    const user_id = session.user.id;
    console.log('Calling RPC with user_id:', user_id); // Log the user_id for debugging

    // Call Supabase function (handles SQL internally)
    const { data, error } = await supabase.rpc('get_listing_views_by_user', {
      p_user_id: user_id,  // Pass user_id from the session
    });

    // Return the data if successful
    return NextResponse.json(data);

  } catch (err) {
    // Catch unexpected errors and log them
    console.error('Unexpected error in GET request:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
/* Sample return from most viewed to least viewed
[
    {
        "listing_id": "",
        "title": "",
        "listing_type": "BUY_NOW",
        "price": 700,
        "image_url": ""
    },
    {
        "listing_id": "",
        "title": """,
        "listing_type": "BID",
        "price": 500,
        "image_url": ""
    }
]
*/