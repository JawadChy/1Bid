import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const formData = await request.json();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's rating from profile
    const { data: profile } = await supabase
      .from('profile')
      .select('rating')
      .eq('id', user.id)
      .single();

    // Insert application
    const { data, error } = await supabase
      .from('superapplication')
      .insert({
        ...formData,
        applicant_id: user.id,
        rating: profile?.rating
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { application_id, status } = await request.json();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Start a transaction
    if (status === 'APPROVED') {
      const { data: application } = await supabase
        .from('superapplication')
        .select('applicant_id')
        .eq('id', application_id)
        .single();

      if (application) {
        // Update profile role
        await supabase
          .from('profile')
          .update({ role: 'S' })
          .eq('id', application.applicant_id);
      }
    }

    // Update application status
    const { error } = await supabase
      .from('superapplication')
      .update({ status })
      .eq('id', application_id);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
} 