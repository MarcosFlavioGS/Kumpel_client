'use client'

import { useEffect, useState, useRef } from 'react'
import useStore from '@/app/store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useChannel } from '@/app/hooks/useChannel'

interface Message {
  body: string
  user: string
  code: string
  color: string
  timestamp: string
}

interface ChatRoomProps {
  room: {
    id: string
    name: string
    code: string
  }
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

export default function ChatRoom({ room }: ChatRoomProps) {
  const [input, setInput] = useState('')
  const [userColor, setUserColor] = useState('')
  const [messages, setMessages] = useState<Message[]>([])

  const user = useStore((state) => state.userName)
  const token = useStore((state) => state.token)

  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const { messages: channelMessages, sendMessage } = useChannel(`chat_room:${room.code}`)

  useEffect(() => {
    if (!user || !token || !room?.code) return

    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission()
    }

    // Set user color
    const colors = Object.values(UserColor)
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    setUserColor(randomColor)
  }, [user, token, room?.code])

  useEffect(() => {
    if (channelMessages.length > 0) {
      const lastMessage = channelMessages[channelMessages.length - 1]
      if (lastMessage.event === 'new_message') {
        setMessages((prev) => [...prev, { ...lastMessage.payload, timestamp: new Date().toISOString() }])

        // Show notification if not focused
        if (document.hidden && Notification.permission === 'granted') {
          new Notification('New Message', {
            body: `${lastMessage.payload.user}: ${lastMessage.payload.body}`
          })
        }
      }
    }
  }, [channelMessages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !room?.code) return

    sendMessage('new_message', {
      body: input,
      user,
      code: room.code,
      color: userColor
    })

    setInput('')
  }

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages])

  if (!room) {
    return <div className='h-full flex items-center justify-center text-gray-500'>No room selected</div>
  }

  return (
    <div className='flex flex-col h-full bg-[#36393f]'>
      {/* Room Header */}
      <div className='border-b border-[#202225] bg-[#36393f] p-4'>
        <div className='flex items-center gap-3'>
          <Avatar className='bg-indigo-600'>
            <AvatarFallback className='text-white'>{room.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className='font-semibold text-white'>{room.name}</h2>
            <p className='text-sm text-gray-400'>Code: {room.code}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className='flex-1 p-4'>
        <div className='space-y-4'>
          {messages.map((message, index) => (
            <div
              key={index}
              className='flex gap-3'>
              <Avatar className='bg-indigo-600'>
                <AvatarFallback className='text-white'>{message.user[0]}</AvatarFallback>
              </Avatar>
              <div className='flex-1'>
                <div className='flex items-baseline gap-2'>
                  <span className='font-medium text-white'>{message.user}</span>
                  <span className='text-xs text-gray-400'>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p
                  className='text-gray-300'
                  style={{ color: message.color }}>
                  {message.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className='border-t border-[#202225] bg-[#40444b] p-4'>
        <form
          onSubmit={handleSendMessage}
          className='flex gap-2'>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Type a message...'
            className='flex-1 bg-[#40444b] border-[#202225] text-white placeholder:text-gray-400 focus:border-indigo-500'
          />
          <Button
            type='submit'
            className='bg-indigo-600 hover:bg-indigo-700 text-white'>
            Send
          </Button>
        </form>
      </div>
    </div>
  )
}
