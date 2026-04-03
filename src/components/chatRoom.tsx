'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useUserStore, useChatStore } from '@/app/stores'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useChannel } from '@/hooks/useChannel'
import { ChevronDown, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { kumpelFieldClass } from '@/lib/kumpel-ui'

interface ChatRoomProps {
  room: {
    id: string
    name: string
    code: string
  }
  /** Mobile stacked layout: return to channel list without clearing the selected room */
  onNavigateBack?: () => void
}

const USER_COLORS = [
  '#FF5733',
  '#3357FF',
  '#9B33FF',
  '#FF9A33',
  '#FFEB33',
  '#33FFEB',
  '#FF33A6',
  '#57F287'
] as const

function colorForDisplayName(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) {
    h = name.charCodeAt(i) + ((h << 5) - h)
  }
  return USER_COLORS[Math.abs(h) % USER_COLORS.length]
}

export default function ChatRoom({ room, onNavigateBack }: ChatRoomProps) {
  const [input, setInput] = useState('')
  const [userColor, setUserColor] = useState('')
  const [isAtBottom, setIsAtBottom] = useState(true)
  const messages = useChatStore((state) => state.messages)
  const setMessages = useChatStore((state) => state.setMessages)
  const user = useUserStore((state) => state.userName)
  const token = useUserStore((state) => state.token)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const { messages: channelMessages, sendMessage, connectionStatus, error: channelError } = useChannel(
    `chat_room:${room.id}`,
    { code: room.code, token: token || undefined }
  )

  const connectionLabel = useMemo(() => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected'
      case 'connecting':
        return 'Connecting…'
      case 'error':
        return 'Connection issue'
      default:
        return 'Offline'
    }
  }, [connectionStatus])

  useEffect(() => {
    if (!user || !token || !room?.code) return

    if ('Notification' in window) {
      void Notification.requestPermission()
    }

    setUserColor(colorForDisplayName(user))
  }, [user, token, room?.code])

  useEffect(() => {
    if (channelMessages.length === 0) return
    const lastMessage = channelMessages[channelMessages.length - 1]
    if (lastMessage.event !== 'new_message') return

    setMessages((prev) => [
      ...prev,
      { ...lastMessage.payload, code: room.code, timestamp: new Date().toISOString() }
    ])

    if (document.hidden && Notification.permission === 'granted') {
      new Notification('New message', {
        body: `${lastMessage.payload.user}: ${lastMessage.payload.body}`
      })
    }
  }, [channelMessages, room.code, setMessages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !room?.code || connectionStatus !== 'connected') return

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
      const isBottom = scrollHeight - scrollTop <= clientHeight + 10
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- isAtBottom intentionally omitted; see history
  }, [messages])

  if (!room) {
    return (
      <div className='flex h-full items-center justify-center text-kumpel-muted'>No room selected</div>
    )
  }

  const canSend = connectionStatus === 'connected' && Boolean(userColor)

  return (
    <div className='flex h-full flex-col bg-kumpel-bg'>
      <header className='flex shrink-0 items-center justify-between gap-2 border-b border-kumpel-border bg-kumpel-bg px-2 py-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:gap-3 sm:px-4 sm:py-3 sm:pt-3'>
        <div className='flex min-w-0 flex-1 items-center gap-2 sm:gap-3'>
          {onNavigateBack ? (
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='shrink-0 text-kumpel-muted hover:bg-kumpel-hover hover:text-white md:hidden'
              onClick={onNavigateBack}
              aria-label='Back to channels'>
              <ChevronLeft className='h-6 w-6' />
            </Button>
          ) : null}
          <Avatar className='h-9 w-9 shrink-0 ring-2 ring-kumpel-border sm:h-10 sm:w-10'>
            <AvatarFallback className='bg-kumpel-accent text-sm font-bold text-white'>
              {room.name.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className='min-w-0'>
            <h2 className='truncate text-base font-semibold text-white'>{room.name}</h2>
            <p className='truncate font-mono text-xs text-kumpel-muted'>Access code · {room.code}</p>
          </div>
        </div>
        <div
          className='flex shrink-0 items-center gap-2 rounded-full border border-kumpel-border bg-kumpel-sidebar/80 px-3 py-1.5'
          title={channelError || connectionLabel}>
          <span
            className={cn(
              'h-2 w-2 shrink-0 rounded-full',
              connectionStatus === 'connected' && 'bg-kumpel-success shadow-[0_0_8px_rgba(35,165,89,0.7)]',
              connectionStatus === 'connecting' && 'animate-pulse bg-amber-400',
              connectionStatus === 'error' && 'bg-kumpel-danger',
              connectionStatus === 'disconnected' && 'bg-kumpel-border'
            )}
            aria-hidden
          />
          <span className='hidden text-xs font-medium text-kumpel-muted sm:inline'>{connectionLabel}</span>
        </div>
      </header>

      {channelError && connectionStatus === 'error' ? (
        <div
          className='border-b border-kumpel-danger/30 bg-kumpel-danger/10 px-4 py-2 text-center text-sm text-red-200'
          role='alert'>
          {channelError}
        </div>
      ) : null}

      <div className='relative flex min-h-0 flex-1'>
        {/* Side rails: darker than the thread so the centered column reads as the “chat surface” (Discord-style) */}
        <div
          className='hidden min-w-0 flex-1 bg-kumpel-elevated/90 bg-[linear-gradient(90deg,rgba(0,0,0,0.12),transparent)] md:block'
          aria-hidden
        />
        <div
          ref={messagesContainerRef}
          className='h-full min-h-0 w-full min-w-0 flex-1 overflow-y-auto border-kumpel-border/80 bg-kumpel-sidebar/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:w-[48rem] md:max-w-[48rem] md:flex-none md:border-x lg:w-[52rem] lg:max-w-[52rem] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-kumpel-elevated/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-kumpel-border hover:[&::-webkit-scrollbar-thumb]:bg-kumpel-hover-strong'
          onScroll={checkIfAtBottom}>
          <div className='space-y-1 px-3 py-4 sm:px-6'>
            {messages.length === 0 ? (
              <p className='py-12 text-center text-sm text-kumpel-muted'>
                No messages yet. Say hello — this channel is quiet.
              </p>
            ) : null}
            {messages.map((message, index) => {
              const isSelf = message.user === user
              return (
                <div
                  key={`${message.timestamp}-${index}-${message.user}`}
                  className={cn(
                    'group flex gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.03]',
                    isSelf && 'flex-row-reverse'
                  )}>
                  <Avatar className='mt-0.5 h-9 w-9 shrink-0 ring-1 ring-kumpel-border'>
                    <AvatarFallback className='bg-kumpel-input text-xs font-semibold text-white'>
                      {message.user.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      'min-w-0 max-w-[min(100%,42rem)] rounded-2xl px-3 py-2',
                      isSelf ? 'bg-kumpel-accent/25 text-white' : 'bg-kumpel-sidebar text-zinc-100 ring-1 ring-white/[0.05]'
                    )}>
                    <div
                      className={cn(
                        'flex flex-wrap items-baseline gap-x-2 gap-y-0',
                        isSelf && 'flex-row-reverse'
                      )}>
                      <span
                        className={cn('text-sm font-semibold', isSelf && 'text-white')}
                        style={isSelf ? undefined : { color: message.color }}>
                        {message.user}
                      </span>
                      <time
                        className='text-[11px] text-kumpel-muted'
                        dateTime={message.timestamp}>
                        {new Date(message.timestamp).toLocaleTimeString(undefined, {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </time>
                    </div>
                    <p className='mt-0.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-200'>
                      {message.body}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div
          className='hidden min-w-0 flex-1 bg-kumpel-elevated/90 bg-[linear-gradient(270deg,rgba(0,0,0,0.12),transparent)] md:block'
          aria-hidden
        />

        {!isAtBottom && messages.length > 0 ? (
          <Button
            type='button'
            size='sm'
            variant='secondary'
            onClick={() => {
              scrollToBottom()
              setIsAtBottom(true)
            }}
            className='absolute bottom-4 right-4 gap-1 rounded-full border-kumpel-border bg-kumpel-sidebar shadow-lg ring-1 ring-white/10 hover:bg-kumpel-hover'>
            <ChevronDown className='h-4 w-4' />
            Latest
          </Button>
        ) : null}
      </div>

      <div className='shrink-0 border-t border-kumpel-border bg-kumpel-elevated/80 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:p-4 sm:pb-4'>
        <form
          onSubmit={handleSendMessage}
          className='mx-auto flex w-full min-w-0 max-w-full gap-2 px-3 sm:px-6 md:w-[48rem] md:max-w-[48rem] lg:w-[52rem] lg:max-w-[52rem]'>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              connectionStatus === 'connecting'
                ? 'Connecting to channel…'
                : connectionStatus !== 'connected'
                  ? 'Waiting for connection…'
                  : 'Message the channel'
            }
            disabled={!canSend}
            className={cn(
              kumpelFieldClass,
              'h-11 flex-1 border-kumpel-border bg-kumpel-input text-[15px] text-white placeholder:text-kumpel-muted'
            )}
            autoComplete='off'
            aria-label='Message'
          />
          <Button
            type='submit'
            variant='kumpel'
            disabled={!canSend || !input.trim()}
            className='h-11 shrink-0 px-5 font-semibold'>
            Send
          </Button>
        </form>
      </div>
    </div>
  )
}
