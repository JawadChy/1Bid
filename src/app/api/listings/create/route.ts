// app/api/listings/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profile')
      .select('role, is_suspended')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    if (profile.is_suspended) {
      return NextResponse.json(
        { error: 'Account is suspended' },
        { status: 403 }
      )
    }

    if (profile.role !== 'U' && profile.role !== 'S') {
      return NextResponse.json(
        { error: 'Only users can create listings' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    
    // Validate required fields
    const title = formData.get('title')
    const description = formData.get('description')
    const category = formData.get('category')
    const listingType = formData.get('listingType')

    if (!title || !description || !category || !listingType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create the main listing
    const { data: listing, error: listingError } = await supabase
      .from('listing')
      .insert({
        seller_id: user.id,
        title,
        description,
        category,
        listing_type: listingType,
        status: 'ACTIVE'
      })
      .select()
      .single()

    if (listingError) {
      console.error('Listing creation error:', listingError)
      return NextResponse.json(
        { error: 'Failed to create listing' },
        { status: 500 }
      )
    }

    // Handle listing type specific data
    if (listingType === 'BUY_NOW') {
      const askingPrice = formData.get('askingPrice')
      if (!askingPrice) {
        // Rollback main listing
        await supabase.from('listing').delete().eq('id', listing.id)
        return NextResponse.json(
          { error: 'Asking price is required for buy now listings' },
          { status: 400 }
        )
      }

      const { error: buyNowError } = await supabase
        .from('buy_now_listing')
        .insert({
          listing_id: listing.id,
          asking_price: parseFloat(askingPrice as string),
          min_offer_price: formData.get('minOfferPrice') ? 
            parseFloat(formData.get('minOfferPrice') as string) : 
            null
        })

      if (buyNowError) {
        // Rollback main listing
        await supabase.from('listing').delete().eq('id', listing.id)
        console.error('Buy now listing error:', buyNowError)
        return NextResponse.json(
          { error: 'Failed to create buy now listing details' },
          { status: 500 }
        )
      }
    } else {
      // Handle BID type
      const startingPrice = formData.get('startingPrice')
      const endTime = formData.get('endTime')
      const minBidIncrement = formData.get('minBidIncrement')

      if (!startingPrice || !endTime) {
        // Rollback main listing
        await supabase.from('listing').delete().eq('id', listing.id)
        return NextResponse.json(
          { error: 'Starting price and end time are required for bid listings' },
          { status: 400 }
        )
      }

      const { error: bidError } = await supabase
        .from('bid_listing')
        .insert({
          listing_id: listing.id,
          starting_price: parseFloat(startingPrice as string),
          end_time: new Date(endTime as string).toISOString(),
          min_bid_increment: minBidIncrement ? 
            parseFloat(minBidIncrement as string) : 
            1.00
        })

      if (bidError) {
        // Rollback main listing
        await supabase.from('listing').delete().eq('id', listing.id)
        console.error('Bid listing error:', bidError)
        return NextResponse.json(
          { error: 'Failed to create bid listing details' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ 
      message: 'Listing created successfully',
      listing: {
        id: listing.id,
        title: listing.title,
        type: listingType
      }
    })

  } catch (error) {
    console.error('Error creating listing:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}