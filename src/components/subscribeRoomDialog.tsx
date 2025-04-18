'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUserStore } from '@/app/stores'
import { useRouter } from 'next/navigation'
import { API_URL } from '@/config'

export function SubscribeRoomDialog() {
  const [roomId, setRoomId] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const token = useUserStore((state) => state.token)

  const handleSubscribe = async () => {
    if (!roomId || !code) {
      setError('Please fill in all fields')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`${API_URL}/api/rooms/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          room_id: parseInt(roomId),
          code: code
        })
      })

      const data = await response.json()

      if (data.status !== ':ok') {
        throw new Error(data.message || 'Failed to subscribe to room')
      }

      // Only refresh and close dialog on successful subscription
      setOpen(false)
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to subscribe to room')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-[#40444b] hover:bg-[#36393f] text-white border-[#202225]">
          Subscribe to Room
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#2f3136] border-[#202225] text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Subscribe to a Room</DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter the room ID and access code to join a room.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="roomId" className="text-right text-gray-300">
              Room ID
            </Label>
            <Input
              id="roomId"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="col-span-3 bg-[#40444b] border-[#202225] text-white placeholder:text-gray-400 focus:border-indigo-500"
              type="number"
              placeholder="Enter room ID"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="code" className="text-right text-gray-300">
              Access Code
            </Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="col-span-3 bg-[#40444b] border-[#202225] text-white placeholder:text-gray-400 focus:border-indigo-500"
              placeholder="Enter access code"
            />
          </div>
          {error && (
            <div className="col-span-4 text-sm text-red-400 text-center">{error}</div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubscribe}
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {isLoading ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 