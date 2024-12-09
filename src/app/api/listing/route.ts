import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id') // Retrieve the id from query parameters
  
  if (!id) {
    return NextResponse.json(
      { error: 'Listing id needed' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  let query = supabase
    .from('listing')
    .select(`
      *,
      listing_image!inner (
        public_url
      ),
      bid_listing (
        starting_price,
        end_time,
        curr_bid_amt
      ),
      buy_now_listing (
        asking_price
      )
    `)
    .eq('id', id) // Narrow down to one entry of table


  const category = searchParams.get('category')
  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  const listingType = searchParams.get('listingType')
  if (listingType && listingType !== 'all') {
    query = query.eq('listing_type', listingType === 'auction' ? 'BID' : 'BUY_NOW')
  }

  const itemType = searchParams.get('itemType')
  if (itemType && itemType !== 'all') {
    query = query.eq('item_or_service', itemType === 'item')
  }

  const forRent = searchParams.get('forRent')
  if (forRent !== null) {
    query = query.eq('for_rent', forRent === 'true')
  }


  try {
    // Fetch the single listing
    const { data: listing, error: supabaseError } = await query.single()
    // Other type of error fetching excluding non-existent listing
    if (supabaseError) {
      console.error('Supabase error:', supabaseError)
      return NextResponse.json(
        { error: supabaseError.message },
        { status: 500 }
      )
    }
    // Means resource not found
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    const price = listing.listing_type === 'BID' 
      ? (listing.bid_listing?.[0]?.curr_bid_amt || listing.bid_listing?.[0]?.starting_price)
      : listing.buy_now_listing?.[0]?.asking_price


    return NextResponse.json({
      listing: {
        ...listing,
        price,
        imageUrl: listing.listing_image.public_url, 
        end_time: listing.bid_listing?.[0]?.end_time,
        curr_bid_amt: listing.bid_listing?.[0]?.curr_bid_amt
      }
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch listing' },
      { status: 500 }
    )
  }
}
