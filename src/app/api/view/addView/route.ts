import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Get POST request body for listing_id
  const json = await request.json()
  const { listing_id } = json

  if (!listing_id) {
    return NextResponse.json({ error: 'Missing listing_id' }, { status: 400 })
  }

  try {
    // First, check if the listing is active
    const { data: listing, error: listingError } = await supabase
      .from('listing')
      .select('status, views')
      .eq('id', listing_id)
      .single();

    if (listingError) {
      throw listingError;
    }

    // Only proceed with view logging and increment if listing is active
    if (listing.status === 'ACTIVE') {
      // Increment views in the listing table
      const { error: updateError } = await supabase
        .from('listing')
        .update({ views: (listing.views || 0) + 1 })
        .eq('id', listing_id);

      if (updateError) {
        throw updateError;
      }

      // Get the session to log the view if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();

      // If user is authenticated, log the view in view_history
      if (session?.user) {
        const { error: viewError } = await supabase.rpc('log_view', {
          p_user_id: session.user.id,
          p_listing_id: listing_id
        });

        if (viewError) {
          throw viewError;
        }
      }
    }

    return NextResponse.json({ status: 200, message: 'View processed successfully' });

  } catch (error) {
    console.error('Error processing view:', error);
    return NextResponse.json(
      { error: 'Failed to process view' },
      { status: 500 }
    );
  }
}
