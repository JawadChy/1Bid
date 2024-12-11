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

    // Create the complaint object
    const complaintData = {
      listing_id,
      complainant_id: user.id,
      accused_id,
      content: content.trim(),
      status: 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Attempting to insert:', complaintData);

    // Try the insert with error handling
    const { data, error: insertError } = await supabase
      .from('complaint')
      .insert(complaintData)
      .select('*')
      .single();

    if (insertError) {
      // Log specific error properties
      const errorDetails = {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        full: JSON.stringify(insertError)
      };
      
      console.error('Detailed insert error:', errorDetails);
      
      return NextResponse.json({ 
        error: 'Failed to submit complaint',
        details: errorDetails
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      data 
    });

  } catch (error) {
    const errorDetails = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      full: JSON.stringify(error)
    } : error;

    console.error('Unexpected error:', errorDetails);
    
    return NextResponse.json({
      error: 'Failed to submit complaint',
      details: errorDetails
    }, { status: 500 });
  }
} 