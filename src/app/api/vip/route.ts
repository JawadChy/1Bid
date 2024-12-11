import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const json = await request.json();
  const { profileId } = json;

  if (!profileId) {
    return NextResponse.json({ error: 'profileId is required' }, { status: 400 });
  }

  try {
    // Call the stored procedure
    const { error } = await supabase.rpc('check_vip_status', { profile_id: profileId });

    if (error) {
      console.error('Error executing stored procedure:', error);
      return NextResponse.json({ error: 'An error occurred while updating VIP status' }, { status: 500 });
    }

    return NextResponse.json({ message: 'VIP status updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
