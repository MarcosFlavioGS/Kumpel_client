'use client'

import { useState, useEffect } from 'react'
import useStore from '@/app/store'
import styles from '@/app/styles/landing.module.css'
import Image from 'next/image'

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const setUserToken = useStore((state) => state.setToken)
  const setUserEmail = useStore((state) => state.setEmail)
  const setUserName = useStore((state) => state.setUserName)
  const setChatIdState = useStore((state) => state.setChatId)
  const setCodeState = useStore((state) => state.setCode)

  useEffect(() => {
    // Clear any existing authentication data
    setUserName('')
    setChatIdState('')
    setCodeState('')
    setUserToken('')
    setUserEmail('')
  }, [])

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
        // Redirect to chat dashboard
        window.location.href = '/dashboard'
      } else {
        setErrorMessage('Invalid email or password')
      }
    } catch (error) {
      setErrorMessage('Connection error. Please try again.')
    }
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <Image
            src='/logo.png'
            alt='Kumpel Chat Logo'
            width={40}
            height={40}
            className={styles.logo}
          />
          <h1 className={styles.title}>Kumpel Chat</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.loginContainer}>
          <h2 className={styles.loginTitle}>Welcome back!</h2>
          <p className={styles.loginSubtitle}>We're excited to see you again!</p>

          <form
            onSubmit={handleLogin}
            className={styles.loginForm}>
            {errorMessage && <div className={styles.error}>{errorMessage}</div>}

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>EMAIL</label>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.inputField}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>PASSWORD</label>
              <input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.inputField}
                required
              />
            </div>

            <button
              type='submit'
              className={styles.loginButton}>
              Login
            </button>

            <div className={styles.registerPrompt}>
              <span>Need an account? </span>
              <a
                href='/register'
                className={styles.registerLink}>
                Create an account
              </a>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3 className={styles.footerHeading}>Kumpel Chat</h3>
            <p>Connecting friends instantly</p>
          </div>
          <div className={styles.footerSection}>
            <h3 className={styles.footerHeading}>Legal</h3>
            <a
              href='/privacy'
              className={styles.footerLink}>
              Privacy Policy
            </a>
            <a
              href='/terms'
              className={styles.footerLink}>
              Terms of Service
            </a>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2024 Kumpel Chat. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
