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
  color: string
}

enum UserColor {
  Red = '#FF5733',
  Green = '#00ff00',
  Blue = '#3357FF',
  Purple = '#9B33FF',
  Orange = '#FF9A33',
  Yellow = '#FFEB33',
  Cyan = '#33FFEB',
  Pink = '#FF33A6'
}

export default function ChatRoom() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [channel, setChannel] = useState<Channel | null>(null)
  const [connectionError, setConnectionError] = useState<string>('')
  const [pingResponse, setPingResponse] = useState('')
  const [userColor, setUserColor] = useState('')

  const user = useStore((state) => state.userName)
  const chatId = useStore((state) => state.chatId)
  const code = useStore((state) => state.code)

  // Ref for the messages container to control scrolling
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Check if userName, chatId, and code are available
  const isReady = user && chatId && code

  useEffect(() => {
    const colors = Object.values(UserColor) // Get an array of enum values
    const randomIndex = Math.floor(Math.random() * colors.length) // Generate a random index

    setUserColor(colors[randomIndex])
  }, [])

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
        setMessages((prev) => [payload, ...prev])
      })

      chatChannel
        .push('ping', { id: chatId })
        .receive('ok', (resp) => {
          console.log('PING: ', resp)
          setPingResponse(resp)
        })
        .receive('error', (resp) => {
          console.log('Error on ping: ', resp)
        })

      return () => {
        chatChannel.leave()
        socket.disconnect()
      }
    }
  }, [isReady])

  // Scroll to the bottom when new messages are added
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && channel) {
      channel.push('new_message', { body: input, user: user, color: userColor })
      setInput('')
    }
  }

  // If the connection error exists, render the error message
  if (connectionError) {
    return <div style={styles.errorMessage}>{connectionError}</div>
  }

  return !isReady ? (
    <LandingPage />
  ) : (
    <div style={styles.container}>
      <div style={styles.chatBox}>
        <h1 style={{ ...styles.header, color: userColor }}>
          {user} : {pingResponse}
        </h1>

        <div
          ref={messagesContainerRef}
          style={styles.messagesContainer}>
          {messages.map((msg, index) => (
            <p
              key={index}
              style={styles.message}>
              <span
                style={{ ...styles.user, color: msg.color || '#00ff00' }} // Default to green if no color is provided
              >
                {msg.user}:
              </span>{' '}
              <span style={styles.body}>{msg.body}</span>
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
