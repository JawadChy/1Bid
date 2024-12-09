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

  try {

    const { data: listing, error: listingError } = await supabase
      .from('listing')
      .select(`
        id,
        title,
        description,
        category,
        listing_type,
        created_at,
        updated_at,
        item_or_service,
        views,
        rent,
        status
      `)
      .eq('id', id)
      .single()

    if (listingError || !listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    // Fetch both bid_listing and buy_now_listing data
    const { data: bidListing, error: bidError } = await supabase
      .from('bid_listing')
      .select(`
        starting_price,
        curr_bid_amt,
        end_time,
        min_bid_increment
      `)
      .eq('listing_id', id)
      .single()

    const { data: buyNowListing, error: buyNowError } = await supabase
      .from('buy_now_listing')
      .select(`
        asking_price,
        min_offer_price
      `)
      .eq('listing_id', id)
      .single()


    if (bidError && buyNowError) {
      return NextResponse.json(
        { error: 'Neither bid nor buy now listing found' },
        { status: 404 }
      )
    }

    // Listing Image
    const { data: listingImage, error: imageError } = await supabase
      .from('listing_image')
      .select('public_url')
      .eq('listing_id', id)

    if (imageError || !listingImage || listingImage.length === 0) {
      return NextResponse.json(
        { error: 'Listing images not found' },
        { status: 404 }
      )
    }

    // Determine the price and additional info based on listing type
    let finalPrice = null;
    let additionalInfo = {};

    if (listing.listing_type === 'BID') {
      finalPrice = bidListing?.curr_bid_amt || bidListing?.starting_price;
      additionalInfo = {
        min_bid_increment: bidListing?.min_bid_increment,
        end_time: bidListing?.end_time
      }
    } else if (listing.listing_type === 'BUY_NOW') {
      finalPrice = buyNowListing?.asking_price;
      additionalInfo = {
        min_offer_price: buyNowListing?.min_offer_price
      }
    }

    const finalListing = {
      ...listing,
      price: finalPrice,
      imageUrl: listingImage[0].public_url,  
      ...additionalInfo 
    }

    return NextResponse.json({
      listing: finalListing
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch listing' },
      { status: 500 }
    )
  }
}
