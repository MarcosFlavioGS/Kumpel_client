'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/app/stores'
import { API_URL } from '@/config'
import { MessagesSquare } from 'lucide-react'
import { kumpelInputClassName, kumpelLabelClass } from '@/lib/kumpel-ui'

interface ValidationError {
  [key: string]: string[]
}

export default function Home() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationError>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const setToken = useUserStore((state) => state.setToken)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setValidationErrors({})
    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, mail: email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors) {
          setValidationErrors(data.errors)
          return
        }
        throw new Error(data.message || 'Failed to create account')
      }

      setToken(data.token)
      router.push('/dashboard')
    } catch (err) {
      console.error('Error creating account:', err)
      setError(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getErrorMessage = (field: string) => {
    if (validationErrors[field] && validationErrors[field].length > 0) {
      return validationErrors[field][0]
    }
    return null
  }

  return (
    <div className='kumpel-auth-bg'>
      <div className='kumpel-auth-panel'>
        <div className='text-center'>
          <div className='mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-kumpel-accent/15 ring-1 ring-kumpel-accent/30'>
            <MessagesSquare
              className='h-8 w-8 text-kumpel-accent'
              aria-hidden
            />
          </div>
          <h1 className='text-2xl font-bold tracking-tight text-white'>Welcome to Kumpel</h1>
          <p className='mt-2 text-sm text-kumpel-muted'>Create an account to get started</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className='mt-2 space-y-5'
          noValidate>
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='name'
                className={kumpelLabelClass}>
                Display name
              </label>
              <Input
                id='name'
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete='name'
                aria-invalid={Boolean(getErrorMessage('name'))}
                className={`mt-1.5 ${kumpelInputClassName({ invalid: Boolean(getErrorMessage('name')) })}`}
              />
              {getErrorMessage('name') && (
                <p
                  className='mt-1.5 text-sm text-kumpel-danger'
                  role='alert'>
                  {getErrorMessage('name')}
                </p>
              )}
            </div>

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
                aria-invalid={Boolean(getErrorMessage('mail'))}
                className={`mt-1.5 ${kumpelInputClassName({ invalid: Boolean(getErrorMessage('mail')) })}`}
              />
              {getErrorMessage('mail') && (
                <p
                  className='mt-1.5 text-sm text-kumpel-danger'
                  role='alert'>
                  {getErrorMessage('mail')}
                </p>
              )}
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
                autoComplete='new-password'
                aria-invalid={Boolean(getErrorMessage('password'))}
                className={`mt-1.5 ${kumpelInputClassName({ invalid: Boolean(getErrorMessage('password')) })}`}
              />
              {getErrorMessage('password') && (
                <p
                  className='mt-1.5 text-sm text-kumpel-danger'
                  role='alert'>
                  {getErrorMessage('password')}
                </p>
              )}
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
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className='text-center text-sm text-kumpel-muted'>
          Already have an account?{' '}
          <Link
            href='/login'
            className='kumpel-link'>
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
