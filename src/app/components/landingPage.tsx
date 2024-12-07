'use client'

import { useState, useEffect } from 'react'
import useStore from '../store'
import styles from '../styles/chatRoom'

export default function LandingPage() {
  const [username, setUsername] = useState('')
  const [chatId, setChatId] = useState('')
  const [code, setCode] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const setUserName = useStore((state) => state.setUserName)
  const setChatIdState = useStore((state) => state.setChatId)
  const setCodeState = useStore((state) => state.setCode)

  // Reset the store when landing page is loaded
  useEffect(() => {
    // Clear store values when LandingPage is first mounted
    setUserName('')
    setChatIdState('')
    setCodeState('')
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !chatId || !code) {
      setErrorMessage('All fields are required!')
    } else {
      setErrorMessage('')
      setUserName(username)
      setChatIdState(chatId)
      setCodeState(code)
    }
  }

  return (
    <div style={styles.container}>
      <form
        onSubmit={handleSubmit}
        style={styles.chatBox}>
        <h2 style={styles.header}>Enter Chat Room</h2>
        {errorMessage && <div style={styles.errorMessage}>{errorMessage}</div>}
        <label style={{ marginBottom: '8px', alignSelf: 'flex-start' }}>Username:</label>
        <input
          type='text'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder='Username'
          style={styles.input}
        />
        <label style={{ marginBottom: '8px', alignSelf: 'flex-start' }}>Chat ID:</label>
        <input
          type='text'
          value={chatId}
          onChange={(e) => setChatId(e.target.value)}
          placeholder='Chat Room ID'
          style={styles.input}
        />
        <label style={{ marginBottom: '8px', alignSelf: 'flex-start' }}>Code:</label>
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
