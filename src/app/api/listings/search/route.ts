import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
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
    .eq('status', 'ACTIVE')
    .eq('listing_image.position', 1)

  // filter apply -> query in title or desc -> 
  // category check -> listing check -> item check -> 
  // rent check
  const searchQuery = searchParams.get('query')
  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
  }

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
    query = query.eq('rent', forRent === 'true')
  }

  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  if (minPrice || maxPrice) {
    // deleted this - price filter should be done
    // AFTER fetching cuz we havee to check diff tables
  }

  const sort = searchParams.get('sort') || 'latest'
  switch (sort) {
    case 'latest':
      query = query.order('created_at', { ascending: false })
      break
    case 'popular':
      query = query.order('views', { ascending: false })
      break
  }

  try {
    const { data: listings, error: supabaseError } = await query

    if (supabaseError) {
        console.error('Supabase error:', supabaseError)
        return NextResponse.json(
          { error: supabaseError.message },
          { status: 500 }
        )
      }

    // process listings to include correct price and image information
    const processedListings = listings?.map((listing: any) => {
      const price = listing.listing_type === 'BID' 
        ? (listing.bid_listing?.[0]?.curr_bid_amt || listing.bid_listing?.[0]?.starting_price)
        : listing.buy_now_listing?.[0]?.asking_price

      // price filters
      const minPrice = searchParams.get('minPrice')
      const maxPrice = searchParams.get('maxPrice')

      if ((minPrice && price < parseFloat(minPrice)) || 
          (maxPrice && price > parseFloat(maxPrice))) {
        return null
      }

      return {
        ...listing,
        price,
        imageUrl: listing.listing_image.public_url, // Just need single image URL
        end_time: listing.bid_listing?.[0]?.end_time,
        curr_bid_amt: listing.bid_listing?.[0]?.curr_bid_amt
      }
    }).filter(Boolean)

    // Apply price sorting if needed
    if (sort === 'price_asc' || sort === 'price_desc') {
      processedListings.sort((a, b) => {
        return sort === 'price_asc' 
          ? a.price - b.price 
          : b.price - a.price
      })
    }

    return NextResponse.json({ listings: processedListings })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to search listings' },
        { status: 500 }
    )
  }
}