'use client'

import { useEffect, useState } from 'react'
import { Socket, Channel } from 'phoenix'
import styles from '../styles/chatRoom'
import useStore from '../store'

interface Message {
  body: string
}

export default function ChatRoom() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [channel, setChannel] = useState<Channel | null>(null)

  const user = useStore((state) => state.userName)
  const chatId = useStore((state) => state.chatId)

  useEffect(() => {
    const socket = new Socket('ws://localhost:4000/socket')
    socket.connect()

    const chatChannel = socket.channel(`chat_room:${chatId}`, {})
    setChannel(chatChannel)

    chatChannel
      .join()
      .receive('ok', (resp) => console.log('Joined successfully', resp))
      .receive('error', (resp) => console.log('Unable to join', resp))

    chatChannel.on('new_message', (payload) => {
      setMessages((prev) => [...prev, payload])
    })

    return () => {
      chatChannel.leave()
      socket.disconnect()
    }
  }, [])

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && channel) {
      channel.push('new_message', { body: input })
      setInput('')
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.chatBox}>
        <h1 style={styles.header}>Chat Room: {chatId}</h1>

        <div style={styles.messagesContainer}>
          {messages.map((msg, index) => (
            <p
              key={index}
              style={styles.message}>
              <strong>{user}:</strong> {msg.body}
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
            style={styles.button}>
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
