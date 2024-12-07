'use client'

import { useEffect, useState, useRef } from 'react'
import { Socket, Channel } from 'phoenix'
import styles from '../styles/chatRoom'
import useStore from '../store'
import LandingPage from '../components/landingPage' // Import LandingPage component

interface Message {
  body: string
  user: string
  code: string
}

export default function ChatRoom() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [channel, setChannel] = useState<Channel | null>(null)
  const [connectionError, setConnectionError] = useState<string>('')

  const user = useStore((state) => state.userName)
  const chatId = useStore((state) => state.chatId)
  const code = useStore((state) => state.code)

  // Ref for the messages container to control scrolling
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Check if userName, chatId, and code are available
  const isReady = user && chatId && code

  useEffect(() => {
    if (isReady) {
      const socket = new Socket('ws://localhost:4000/socket')
      socket.connect()

      const chatChannel = socket.channel(`chat_room:${chatId}`, { code: code })
      setChannel(chatChannel)

      chatChannel
        .join()
        .receive('ok', (resp) => {
          console.log('Joined successfully', resp)
          setConnectionError('')
        })
        .receive('error', (resp) => {
          console.log('Unable to join', resp)
          setConnectionError(resp.reason || 'An unknown error occurred')
        })

      chatChannel.on('new_message', (payload) => {
        setMessages((prev) => [...prev, payload])
      })

      return () => {
        chatChannel.leave()
        socket.disconnect()
      }
    }
  }, [isReady, user, chatId, code])

  // Scroll to the bottom when new messages are added
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && channel) {
      channel.push('new_message', { body: input, user: user })
      setInput('')
    }
  }

  // If the connection error exists, render the error message
  if (connectionError) {
    return <div style={styles.errorMessage}>{connectionError}</div>
  }
  // If the values aren't set, render the LandingPage
  if (!isReady) {
    return <LandingPage />
  }

  return (
    <div style={styles.container}>
      <div style={styles.chatBox}>
        <h1 style={styles.header}>Chat Room: {chatId}</h1>

        <div
          ref={messagesContainerRef}
          style={styles.messagesContainer}>
          {messages.map((msg, index) => (
            <p
              key={index}
              style={styles.message}>
              <strong>{msg.user}:</strong> {msg.body}
            </p>
          ))}
        </div>

        <form
          onSubmit={sendMessage}
          style={styles.form}>
          <input
            type='text'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Type a message'
            style={styles.input}
          />
          <button
            type='submit'
            style={styles.send_button}>
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
