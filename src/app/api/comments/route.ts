import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const json = await request.json()
  const { listing_id, content } = json

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // if no session, create anonymous comment with visitor_id
  if (!session) {
    // Ensure visitor_id is always set for anonymous comments
    const visitor_id = crypto.randomUUID(); // generate unique visitor id
    const { data, error } = await supabase
      .from('comment')
      .insert({
        listing_id,
        content,
        is_visitor: true,
        visitor_id: visitor_id
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  }

  // for logged in users, create comment with user_id 
  const { data, error } = await supabase
    .from('comment')
    .insert({
      listing_id,
      user_id: session.user.id,
      content,
      is_visitor: false
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const listing_id = searchParams.get('listing_id')

  if (!listing_id) {
    return NextResponse.json({ error: 'Listing ID required' }, { status: 400 })
  }

  // join with profile to get user details including role and vip status
  // order by created_at desc to show newest comments first
  const { data, error } = await supabase
    .from('comment')
    .select(`
      *,
      profile:user_id (
        first_name,
        last_name,
        role,
        is_vip
      )
    `)
    .eq('listing_id', listing_id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}