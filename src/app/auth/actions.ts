'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
// import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY)

export async function login(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error')
  }
  else {
    revalidatePath('/', 'layout')
    redirect('/')
  }

}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  console.log('Submitting form data...');

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const profData = {
    fN: formData.get('firstname') as string,
    lN: formData.get('lastname') as string,
  }

  // sign up user
  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    console.error(error);
  }

  const userID = authData.user?.id;

  {/* disabled rls for profle table, figure out rls poliicies later and work it out, this is a temp fix.*/ }
  const { error: profileError } = await supabase
    .from('profile')
    .insert([
      {
        id: userID,
        first_name: profData.fN,
        last_name: profData.lN,
        wallet_bal: 0 //initialize wallet balance to 0
      }
    ])

  if (profileError) {
    console.error('Profile Creation error:', profileError)
  }

  // if (!error && !profileError) {
  //   revalidatePath('/', 'layout')
  //   redirect('/')
  // }
}

// SuspensionCheck function
/*
const handleSuspensionCheck = async (supabase: any) => {
  try {
    // Get the current user's profile
    const { data: { user } } = await supabase.auth.getUser();

    // Get the user's profile details
    const { data: profile, error } = await supabase
      .from('profile')
      .select('suspension_count')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    // Check if suspension count is 3
    if (profile.suspension_count >= 3) {
      // Delete the user's account
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      if (deleteError) throw deleteError;

      // Sign out the user
      await supabase.auth.signOut();

      // Redirect to banned page
      window.location.href = '/auth/signin/banned';
    }
  } catch (error) {
    console.error('Error checking suspension:', error.message);
  }
}
*/

