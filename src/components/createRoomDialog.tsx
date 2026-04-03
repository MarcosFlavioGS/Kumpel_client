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
import { API_URL } from '@/config'

export interface CreatedRoom {
  id: string
  name: string
  code: string
}

interface CreateRoomResponse {
  message?: string
  id?: string
  data?: {
    id: string
    name: string
    code: string
  }
}

interface CreateRoomDialogProps {
  onCreated: (room: CreatedRoom) => void
}

export function CreateRoomDialog({ onCreated }: CreateRoomDialogProps) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const token = useUserStore((state) => state.token)

  const handleCreate = async () => {
    const trimmedName = name.trim()
    const trimmedCode = code.trim()

    if (trimmedName.length < 2) {
      setError('Room name must be at least 2 characters')
      return
    }
    if (trimmedCode.length < 6) {
      setError('Access code must be at least 6 characters')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`${API_URL}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: trimmedName,
          code: trimmedCode
        })
      })

      const data: CreateRoomResponse & { errors?: Record<string, string[]> } = await response
        .json()
        .catch(() => ({}))

      if (!response.ok) {
        if (data.errors && typeof data.errors === 'object') {
          const first = Object.values(data.errors).flat()[0]
          throw new Error(typeof first === 'string' ? first : 'Could not create room')
        }
        throw new Error('Could not create room')
      }

      const roomId = data.data?.id ?? data.id
      const roomName = data.data?.name ?? trimmedName
      const roomCode = data.data?.code ?? trimmedCode

      if (!roomId) {
        throw new Error('Server did not return a room id')
      }

      onCreated({ id: String(roomId), name: roomName, code: roomCode })
      setOpen(false)
      setName('')
      setCode('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create room')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">Create room</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#2f3136] border-[#202225] text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Create a room</DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose a display name and an access code (share the code with people you invite).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="create-room-name" className="text-right text-gray-300">
              Name
            </Label>
            <Input
              id="create-room-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3 bg-[#40444b] border-[#202225] text-white placeholder:text-gray-400 focus:border-indigo-500"
              type="text"
              placeholder="Room name"
              autoComplete="off"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="create-room-code" className="text-right text-gray-300">
              Code
            </Label>
            <Input
              id="create-room-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="col-span-3 bg-[#40444b] border-[#202225] text-white placeholder:text-gray-400 focus:border-indigo-500"
              type="text"
              placeholder="At least 6 characters"
              autoComplete="off"
            />
          </div>
          {error && <div className="col-span-4 text-sm text-red-400 text-center">{error}</div>}
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleCreate}
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {isLoading ? 'Creating…' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
