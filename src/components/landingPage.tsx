'use client'

import { useState, useEffect } from 'react'
import useStore from '@/app/store'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()
  const token = useStore((state) => state.token)
  const setUserToken = useStore((state) => state.setToken)
  const setUserEmail = useStore((state) => state.setEmail)
  const setUserName = useStore((state) => state.setUserName)

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (token) {
      router.push('/dashboard')
    }
  }, [token, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
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
        setUserName(email.split('@')[0]) // Use email prefix as username
        router.push('/dashboard')
      } else {
        setErrorMessage('Invalid email or password')
      }
    } catch (error) {
      setErrorMessage('Connection error. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center">Welcome to Kumpel</h1>
          <p className="text-center text-gray-500">Sign in to continue</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            {errorMessage && (
              <Badge variant="destructive" className="w-full">
                {errorMessage}
              </Badge>
            )}
          </form>
        </CardContent>
        <CardFooter>
          <Button onClick={handleLogin} className="w-full">
            Sign In
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
