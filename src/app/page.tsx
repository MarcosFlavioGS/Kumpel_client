'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/app/stores'

export default function Home() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const setToken = useUserStore((state) => state.setToken)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const response = await fetch('http://localhost:4000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, mail: email, password })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create account')
      }

      const data = await response.json()
      setToken(data.token)
      router.push('/dashboard')
    } catch (error) {
      console.error('Error creating account:', error)
      setError(error instanceof Error ? error.message : 'Failed to create account')
    }
  }

  return (
    <div className='min-h-screen bg-[#36393f] flex flex-col items-center justify-center p-4'>
      <div className='w-full max-w-md space-y-8 bg-[#2f3136] p-8 rounded-lg border border-[#202225]'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-white'>Welcome to Kumpel</h1>
          <p className='mt-2 text-gray-400'>Create an account to get started</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className='mt-8 space-y-6'>
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='name'
                className='block text-sm font-medium text-gray-300'>
                Name
              </label>
              <Input
                id='name'
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className='mt-1 bg-[#40444b] border-[#202225] text-white placeholder:text-gray-400 focus:border-indigo-500'
              />
            </div>

            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-300'>
                Email
              </label>
              <Input
                id='email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className='mt-1 bg-[#40444b] border-[#202225] text-white placeholder:text-gray-400 focus:border-indigo-500'
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-300'>
                Password
              </label>
              <Input
                id='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className='mt-1 bg-[#40444b] border-[#202225] text-white placeholder:text-gray-400 focus:border-indigo-500'
              />
            </div>
          </div>

          {error && <div className='text-sm text-red-400'>{error}</div>}

          <Button
            type='submit'
            className='w-full bg-indigo-600 hover:bg-indigo-700 text-white'>
            Create Account
          </Button>
        </form>

        <div className='text-center'>
          <p className='text-sm text-gray-400'>
            Already have an account?{' '}
            <Link
              href='/login'
              className='text-indigo-400 hover:text-indigo-300'>
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
