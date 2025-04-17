import { useEffect, useState } from 'react'
import { Socket, Channel } from 'phoenix'

interface Message {
  body: string
  user: string
  code?: string
  color: string
}

interface ChannelMessage {
  event: string
  payload: Message
}

interface ChannelOptions {
  code?: string
  token?: string
}

export function useChannel(channelName: string, options: ChannelOptions = {}) {
  const [socket] = useState(
    () =>
      new Socket('wss://kumpel-back.fly.dev/socket', {
        params: { token: options.token }
      })
  )
  const [channel, setChannel] = useState<Channel | null>(null)
  const [messages, setMessages] = useState<ChannelMessage[]>([])
  const [connectionStatus, setConnectionStatus] = useState<
    'disconnected' | 'connecting' | 'connected' | 'error'
  >('disconnected')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    socket.connect()

    // Create the join payload with the code if provided
    const joinPayload = options.code ? { code: options.code } : {}

    const newChannel = socket.channel(channelName, joinPayload)
    setChannel(newChannel)
    setConnectionStatus('connecting')

    newChannel
      .join()
      .receive('ok', (resp) => {
        console.log('Joined successfully', resp)
        setConnectionStatus('connected')
        setError(null)
      })
      .receive('error', (resp) => {
        console.log('Unable to join', resp)
        setConnectionStatus('error')
        setError(resp.reason || 'Failed to join channel')
      })

    newChannel.onMessage = (event, payload) => {
      setMessages((prev) => [...prev, { event, payload }])
      return payload
    }

    return () => {
      newChannel.leave()
      setConnectionStatus('disconnected')
    }
  }, [channelName, options.code, socket])

  const sendMessage = (event: string, payload: Message) => {
    if (channel && connectionStatus === 'connected') {
      return channel.push(event, payload)
    }
    return false
  }

  return {
    messages,
    sendMessage,
    connectionStatus,
    error
  }
}
