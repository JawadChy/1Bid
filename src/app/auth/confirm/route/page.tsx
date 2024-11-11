'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client' 

export default function ConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading')

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token_hash = searchParams.get('token_hash')
        const type = searchParams.get('type')
        const next = searchParams.get('next') ?? '/'

        if (!token_hash || !type) {
          setStatus('error')
          return
        }

        const supabase = createClient()

        const { error } = await supabase.auth.verifyOtp({
          type: type as any,
          token_hash,
        })

        if (error) {
          console.error('Verification error:', error)
          setStatus('error')
          return
        }

        setStatus('success')
        setTimeout(() => {
          router.push(next)
        }, 2000)
      } catch (error) {
        console.error('Confirmation error:', error)
        setStatus('error')
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="max-w-md w-full mx-auto rounded-lg p-8 shadow-input bg-white dark:bg-black">
        {status === 'loading' && (
          <>
            <h1 className="text-2xl font-bold text-center mb-4">Verifying your email...</h1>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          </>
        )}
        
        {status === 'success' && (
          <>
            <h1 className="text-2xl font-bold text-center mb-4 text-green-600">Email Verified!</h1>
            <p className="text-center text-gray-600 dark:text-gray-400">
              Your email has been verified successfully. Redirecting you...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-2xl font-bold text-center mb-4 text-red-600">Verification Failed</h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
              We couldn't verify your email. The link might be expired or invalid.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => router.push('/auth/signin')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Back to Sign In
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}