'use client'

import { useEffect, useState, useRef } from 'react'
import { useUserStore, useChatStore } from '@/app/stores'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useChannel } from '@/app/hooks/useChannel'

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
  const [isAtBottom, setIsAtBottom] = useState(true)
  const messages = useChatStore((state) => state.messages)
  const setMessages = useChatStore((state) => state.setMessages)
  const user = useUserStore((state) => state.userName)
  const token = useUserStore((state) => state.token)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const { messages: channelMessages, sendMessage } = useChannel(`chat_room:${room.id}`, { code: room.code })

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
        setMessages([
          ...messages,
          { ...lastMessage.payload, code: room.code, timestamp: new Date().toISOString() }
        ])

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
      user: user,
      code: room.code,
      color: userColor
    })

    setInput('')
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const checkIfAtBottom = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
      const isBottom = scrollHeight - scrollTop <= clientHeight + 10 // 10px threshold
      setIsAtBottom(isBottom)
    }
  }

  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkIfAtBottom)
      return () => container.removeEventListener('scroll', checkIfAtBottom)
    }
  }, [])

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom()
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
      <div 
        ref={messagesContainerRef}
        className='flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#2f3136] [&::-webkit-scrollbar-thumb]:bg-[#40444b] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#36393f]'
        onScroll={checkIfAtBottom}>
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
                  <span
                    className='font-medium text-white'
                    style={{ color: message.color }}>
                    {message.user}
                  </span>
                  <span className='text-xs text-gray-400'>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className='text-gray-300'>{message.body}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

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
