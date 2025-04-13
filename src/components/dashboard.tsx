'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useUserStore, useChatStore } from '@/app/stores'
import { useRouter } from 'next/navigation'
import ChatRoom from './chatRoom'
import { LogOut } from 'lucide-react'

interface Room {
  name: string
  room_id: number
  code: string
}

interface UserData {
  id: number
  name: string
  mail: string
  created_rooms?: Room[]
  subscribed_rooms?: Room[]
}

interface ChatRoomData {
  id: string
  name: string
  code: string
}

export default function Dashboard() {
  const [rooms, setRooms] = useState<ChatRoomData[]>([])
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const token = useUserStore((state) => state.token)
  const clearAuth = useUserStore((state) => state.clearAuth)
  const setUserName = useUserStore((state) => state.setUserName)
  const setMessages = useChatStore((state) => state.setMessages)

  useEffect(() => {
    if (!token) {
      router.push('/')
      return
    }
    fetchUserRooms()
  }, [token, router])

  const handleLogout = () => {
    clearAuth()
    router.push('/')
  }

  const fetchUserRooms = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`http://localhost:4000/api/users/1`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (response.status === 401) {
        // Token is invalid or expired
        clearAuth()
        router.push('/')
        return
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Get the raw response text first
      const responseText = await response.text()

      try {
        const userData: UserData = JSON.parse(responseText)

        // First validate that we have a user object
        if (!userData || typeof userData !== 'object') {
          throw new Error('Invalid response format: user data not found')
        }

        // Initialize both arrays if missing
        const createdRooms = Array.isArray(userData.created_rooms) ? userData.created_rooms : []
        const subscribedRooms = Array.isArray(userData.subscribed_rooms) ? userData.subscribed_rooms : []

        // Combine created and subscribed rooms
        const allRooms = [...createdRooms, ...subscribedRooms].map((room) => ({
          id: room.room_id.toString(),
          name: room.name,
          code: room.code
        }))

        setRooms(allRooms)
        setUserName(userData.name)
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError)
        throw new Error('Failed to parse server response as JSON')
      }
    } catch (error) {
      console.error('Error fetching user rooms:', error)
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          setError('Cannot connect to the server. Please check if the server is running.')
        } else if (error.message.includes('not JSON')) {
          setError('Server returned invalid data format. Please try again later.')
        } else if (error.message.includes('Invalid response format')) {
          setError('Server returned unexpected data format. Please try again later.')
        } else {
          setError(error.message)
        }
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className='h-full flex items-center justify-center bg-[#36393f]'>
        <div className='text-gray-400'>Loading...</div>
      </div>
    )
  }

  return (
    <div className='flex h-full bg-[#36393f]'>
      {/* Sidebar */}
      <div className='w-64 border-r border-[#202225] bg-[#2f3136] p-4 flex flex-col'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-semibold text-white'>Your Chats</h2>
          <Button
            variant='ghost'
            size='icon'
            onClick={handleLogout}
            className='hover:bg-red-900/20 hover:text-red-400 text-gray-400'>
            <LogOut className='h-5 w-5' />
          </Button>
        </div>
        {error && <div className='mt-2 text-sm text-red-400'>{error}</div>}

        <ScrollArea className='flex-1 mt-4'>
          <div className='space-y-2'>
            {rooms.map((room) => (
              <Card
                key={room.id}
                className={`cursor-pointer hover:bg-[#36393f] border-[#202225] ${
                  selectedRoom?.id === room.id ? 'bg-[#36393f]' : 'bg-[#40444b]'
                }`}
                onClick={() => {
                  setMessages([])
                  setSelectedRoom(room)
                }}>
                <CardContent className='p-3'>
                  <div className='flex items-center gap-3'>
                    <Avatar className='bg-indigo-600'>
                      <AvatarFallback className='text-white'>{room.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className='flex-1 min-w-0'>
                      <p className='font-medium truncate text-white'>{room.name}</p>
                      <p className='text-sm text-gray-400'>Code: {room.code}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className='flex-1 bg-[#36393f]'>
        {selectedRoom ? (
          <ChatRoom room={selectedRoom} />
        ) : (
          <div className='h-full flex items-center justify-center text-gray-400'>
            Select a chat room to start messaging
          </div>
        )}
      </div>
    </div>
  )
}
