'use client'

import { useEffect, useState, useRef } from 'react'
import { Socket, Channel } from 'phoenix'
import useStore from '@/app/store'
import LandingPage from '../components/landingPage'
import { Input } from '@/components/ui/input' // Shadcn Input component
import { Button } from '@/components/ui/button' // Shadcn Button component
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card' // Shadcn Card components
import { ScrollArea } from '@/components/ui/scroll-area' // Shadcn ScrollArea component

import { Avatar, AvatarFallback } from '@/components/ui/avatar' // Shadcn Avatar component
import { Badge } from '@/components/ui/badge' // Shadcn Badge component

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

  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const isReady = user && chatId && code

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission !== 'granted') {
          console.log('Notification permission denied')
        }
      })
    }
  }, [])

  // Set a random user color
  useEffect(() => {
    const colors = Object.values(UserColor)
    const randomIndex = Math.floor(Math.random() * colors.length)
    setUserColor(colors[randomIndex])
  }, [])

  // Connect to the WebSocket and join the channel
  useEffect(() => {
    if (isReady) {
      const socket = new Socket('wss://kumpel-back.fly.dev/socket')
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

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New Message', {
            body: payload.body,
            icon: '/favicon.ico'
          })
        }
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

  if (connectionError) {
    return <div className='text-red-500 p-4'>{connectionError}</div>
  }

  return !isReady ? (
    <LandingPage />
  ) : (
    <div className='flex justify-center items-center h-screen bg-slate-900 '>
      <Card className='w-full max-w-2xl border-none rounded'>
        <CardHeader className='bg-slate-800 p-4 border-b'>
          <div className='flex items-center space-x-2'>
            <Avatar>
              <AvatarFallback>{user[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1
                className='text-lg font-semibold'
                style={{ color: userColor }}>
                {user}
              </h1>
              <Badge
                variant='outline'
                className='text-sm text-slate-400'>
                {pingResponse}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className='p-4 bg-slate-800'>
          <ScrollArea
            ref={messagesContainerRef}
            className='h-96 bg-slate-700 rounded'>
            {messages.map((msg, index) => (
              <div
                key={index}
                className='flex items-start space-x-2 mb-4'>
                <Avatar>
                  <AvatarFallback style={{ backgroundColor: msg.color }}>{msg.user[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p
                    className='text-sm font-medium'
                    style={{ color: msg.color }}>
                    {msg.user}
                  </p>
                  <p className='text-sm text-slate-300'>{msg.body}</p>
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>

        <CardFooter className='bg-slate-800 p-4 border-t'>
          <form
            onSubmit={sendMessage}
            className='flex w-full space-x-2'>
            <Input
              type='text'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Type a message'
              className='flex-1 text-slate-300'
            />
            <Button
              type='submit'
              className='hover:bg-indigo-900 bg-slate-950'>
              Send
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
