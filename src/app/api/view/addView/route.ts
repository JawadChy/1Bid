// /api/view/addView
/* Body required in POST request:
{
  "listing_id": ""
}

*/
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

  // Retrieve the session and validate if visitor or active user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Valid session exists so we may call our SQL function
  if (session && session.user) {
    const userId = session.user.id

    // Call the log_view function in Supabase. No need to worry about details since it is handled by database.
    const { error } = await supabase.rpc('log_view', {
      p_user_id: userId,
      p_listing_id: listing_id
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ status: 200 })
  }

  // If only a visitor
  return NextResponse.json({ status: 200 })
}
