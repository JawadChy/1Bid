import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const type = requestUrl.searchParams.get('type');

    // If no code provided, redirect to error page
    if (!code) {
        return NextResponse.redirect(new URL('/auth/error', request.url));
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    // If error during exchange, redirect to error page
    if (error) {
        return NextResponse.redirect(new URL('/auth/error', request.url));
    }

    // Handle different auth types
    switch (type) {
        case 'recovery':
            return NextResponse.redirect(new URL('/auth/resetpassword', request.url));;
        default:
            return NextResponse.redirect(new URL('/', request.url));
    }
}