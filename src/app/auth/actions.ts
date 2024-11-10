'use server'

// import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
// import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY)

export async function login(formData: FormData) {
  const supabase = await createClient()

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

  // revalidatePath('/', 'layout')
  // redirect('/')
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
    addrs: formData.get('address') as string,
  }

  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    console.error(error);
  }

  const { error: profileError } = await supabase
    .from('profile')
    .insert([
      {
        id: authData.user?.id,
        first_name: profData.fN,
        last_name: profData.lN,
        address: profData.addrs
      }
    ]) 

    if (profileError) {
      console.error('Profile Creation error:', profileError)
    }

  // revalidatePath('/', 'layout')
  // redirect('/')
}