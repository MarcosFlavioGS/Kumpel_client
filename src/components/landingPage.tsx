'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/app/stores'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { API_URL } from '@/config'
import { LogIn } from 'lucide-react'
import { kumpelInputClassName, kumpelLabelClass } from '@/lib/kumpel-ui'

/**
 * Alternate entry (not wired to a route by default). Styled like auth screens for consistency.
 */
export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const token = useUserStore((state) => state.token)
  const setUserToken = useUserStore((state) => state.setToken)
  const setUserEmail = useUserStore((state) => state.setEmail)
  const setUserName = useUserStore((state) => state.setUserName)

  useEffect(() => {
    if (token) {
      router.push('/dashboard')
    }
  }, [token, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mail: email, password })
      })

      if (response.ok) {
        const data = await response.json()
        setUserToken(data.token)
        setUserEmail(email)
        setUserName(email.split('@')[0] ?? email)
        router.push('/dashboard')
      } else {
        setErrorMessage('Invalid email or password')
      }
    } catch {
      setErrorMessage('Connection failed. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='kumpel-auth-bg'>
      <div className='kumpel-auth-panel'>
        <div className='text-center'>
          <div className='mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-kumpel-accent/15 ring-1 ring-kumpel-accent/30'>
            <LogIn
              className='h-7 w-7 text-kumpel-accent'
              aria-hidden
            />
          </div>
          <h1 className='text-2xl font-bold tracking-tight text-white'>Welcome to Kumpel</h1>
          <p className='mt-2 text-sm text-kumpel-muted'>Sign in to continue</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className='mt-2 space-y-5'
          noValidate>
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='landing-email'
                className={kumpelLabelClass}>
                Email
              </label>
              <Input
                id='landing-email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='you@example.com'
                required
                autoComplete='email'
                className={`mt-1.5 ${kumpelInputClassName()}`}
              />
            </div>
            <div>
              <label
                htmlFor='landing-password'
                className={kumpelLabelClass}>
                Password
              </label>
              <Input
                id='landing-password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='••••••••'
                required
                autoComplete='current-password'
                className={`mt-1.5 ${kumpelInputClassName()}`}
              />
            </div>
          </div>
          {errorMessage ? (
            <div
              className='rounded-lg border border-kumpel-danger/40 bg-kumpel-danger/10 px-3 py-2 text-sm text-red-200'
              role='alert'>
              {errorMessage}
            </div>
          ) : null}
          <Button
            type='submit'
            variant='kumpel'
            disabled={isSubmitting}
            className='h-11 w-full text-[15px] font-semibold'>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  )
}
