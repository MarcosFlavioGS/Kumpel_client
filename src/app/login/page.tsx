'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/app/stores'
import { API_URL } from '@/config'
import { LogIn } from 'lucide-react'
import { kumpelInputClassName, kumpelLabelClass } from '@/lib/kumpel-ui'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const token = useUserStore((state) => state.token)
  const setToken = useUserStore((state) => state.setToken)

  useEffect(() => {
    if (token) {
      router.replace('/dashboard')
    }
  }, [token, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mail: email, password })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          typeof errorData.message === 'string' ? errorData.message : 'Failed to log in'
        )
      }

      const data = await response.json()
      setToken(data.token)
      router.replace('/dashboard')
    } catch (err) {
      console.error('Error logging in:', err)
      setError(err instanceof Error ? err.message : 'Failed to log in')
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
          <h1 className='text-2xl font-bold tracking-tight text-white'>Welcome back</h1>
          <p className='mt-2 text-sm text-kumpel-muted'>Log in to continue chatting</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className='mt-2 space-y-5'
          noValidate>
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='email'
                className={kumpelLabelClass}>
                Email
              </label>
              <Input
                id='email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete='email'
                className={`mt-1.5 ${kumpelInputClassName()}`}
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className={kumpelLabelClass}>
                Password
              </label>
              <Input
                id='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete='current-password'
                className={`mt-1.5 ${kumpelInputClassName()}`}
              />
            </div>
          </div>

          {error && (
            <div
              className='rounded-lg border border-kumpel-danger/40 bg-kumpel-danger/10 px-3 py-2 text-sm text-red-200'
              role='alert'>
              {error}
            </div>
          )}

          <Button
            type='submit'
            variant='kumpel'
            disabled={isSubmitting}
            className='h-11 w-full text-[15px] font-semibold'
            aria-busy={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Log in'}
          </Button>
        </form>

        <p className='text-center text-sm text-kumpel-muted'>
          {"Don't have an account?"}{' '}
          <Link
            href='/'
            className='kumpel-link'>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
