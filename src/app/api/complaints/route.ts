import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  try {
    const { listing_id, accused_id, content } = await request.json();

    // Input validation
    if (!listing_id || !accused_id || !content?.trim()) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create the complaint
    const { data, error: insertError } = await supabase
      .from('complaint')
      .insert({
        listing_id,
        complainant_id: user.id,
        accused_id,
        content: content.trim(),
        status: 'PENDING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ 
        error: 'Failed to submit complaint',
        details: insertError
      }, { status: 500 });
    }

    // Check VIP status of accused user after complaint
    await supabase.rpc('check_vip_status', {
      profile_id: accused_id
    });

    return NextResponse.json({ 
      success: true,
      data 
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({
      error: 'Failed to submit complaint',
      details: error
    }, { status: 500 });
  }
} 