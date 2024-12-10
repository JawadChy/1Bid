import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const json = await request.json()
  const { listing_id, content } = json

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // if no session, create anonymous comment with visitor session ID
  if (!session) {
    const visitorId = cookies().get('visitor_id')?.value || 'anonymous'
    const { data, error } = await supabase
      .from('comments')
      .insert({
        listing_id,
        content,
        user_id: null,
        visitor_id: visitorId,
        is_visitor: true
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  }

  // For logged in users
  const { data, error } = await supabase
    .from('comments')
    .insert({
      listing_id,
      content,
      user_id: session.user.id,
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

  const { data, error } = await supabase
    .from('comment')
    .select(`
      *,
      profile:user_id (
        first_name,
        last_name
      ),
      user:user_id (
        email
      )
    `)
    .eq('listing_id', listing_id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}