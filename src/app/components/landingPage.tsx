'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useStore from '../store'
import styles from '../styles/chatRoom'

export default function LandingPage() {
  const [username, setUsername] = useState('')
  const [chatId, setChatId] = useState('')
  const [code, setCode] = useState('')
  const router = useRouter()

  const setUserName = useStore((state) => state.setUserName)
  const setChatIdState = useStore((state) => state.setChatId)
  const setCodeState = useStore((state) => state.setCode)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username && chatId && code) {
      setUserName(username)
      setChatIdState(chatId)
      setCodeState(code)

      router.push('/chatRoom')
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '400px',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          backgroundColor: '#ffffff'
        }}>
        <h2 style={{ textAlign: 'center', marginBottom: '16px' }}>Enter Chat Room</h2>

        <label style={{ marginBottom: '8px' }}>Username:</label>
        <input
          type='text'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder='Username'
          style={styles.input}
        />

        <label style={{ marginBottom: '8px' }}>Chat ID:</label>
        <input
          type='text'
          value={chatId}
          onChange={(e) => setChatId(e.target.value)}
          placeholder='Chat Room ID'
          style={styles.input}
        />

        <label style={{ marginBottom: '8px' }}>Code:</label>
        <input
          type='text'
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder='Access code'
          style={styles.input}
        />

        <button
          type='submit'
          style={styles.button}>
          Join Chat
        </button>
      </form>
    </div>
  )
}
