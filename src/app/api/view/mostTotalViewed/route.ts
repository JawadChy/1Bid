// GET /api/view/mostTotalViewed
import { createClient } from '@/lib/supabase/server'; 
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Establish supabase client
    const supabase = await createClient(); 

    // Query the 'most_viewed_bids' view
    const { data: mostBids, error: bidsError } = await supabase
      .from('most_viewed_bids')
      .select('*');
    
    // Query the 'most_viewed_buys' view
    const { data: mostBuys, error: buysError } = await supabase
      .from('most_viewed_buys') 
      .select('*');

    if (bidsError || buysError) {
      return NextResponse.json(
        { error: 'Failed to retrieve data', details: bidsError?.message || buysError?.message },
        { status: 500 }
      );
    }

    // Return the combined data
    return NextResponse.json({
      buys: mostBuys, 
      bids: mostBids, 
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/* Sample response
{
    "buys": [
        {
            "listing_id": ",
            "viewers": 0
        },
        {
            "listing_id": "",
            "viewers": 0
        }
    ],
    "bids": [
        {
            "listing_id": "",
            "viewers": 0
        },
        {
            "listing_id": "",
            "viewers": 0
        }
    ]
}
*/
