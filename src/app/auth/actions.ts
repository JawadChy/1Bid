'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient();

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

  const applicationData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    first_name: formData.get('firstname') as string,
    last_name: formData.get('lastname') as string,
  }

  try {
    // Store application in applications table
    const { error: applicationError } = await supabase
      .from('applications')
      .insert([applicationData]);

    if (applicationError) throw applicationError;

    return { success: true };

  } catch (error) {
    console.error('Application submission error:', error);
    throw error;
  }
}