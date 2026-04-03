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
import { kumpelInputClassName, kumpelLabelClass } from '@/lib/kumpel-ui'
import { Plus } from 'lucide-react'

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
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const token = useUserStore((state) => state.token)

  const handleCreate = async () => {
    const trimmedName = name.trim()

    if (trimmedName.length < 2) {
      setError('Room name must be at least 2 characters')
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
          name: trimmedName
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
      const roomCode = data.data?.code

      if (!roomId) {
        throw new Error('Server did not return a room id')
      }
      if (!roomCode) {
        throw new Error('Server did not return an access code')
      }

      onCreated({ id: String(roomId), name: roomName, code: roomCode })
      setOpen(false)
      setName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create room')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='kumpel'
          className='h-10 w-full gap-2 font-semibold'>
          <Plus className='h-4 w-4' />
          Create channel
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[440px] rounded-xl border-kumpel-border bg-kumpel-sidebar text-white shadow-kumpel-glow'>
        <DialogHeader>
          <DialogTitle className='text-lg text-white'>Create a channel</DialogTitle>
          <DialogDescription className='text-kumpel-muted'>
            Choose a name. The server generates an access code you can share so others can join.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void handleCreate()
          }}
          className='grid gap-4 py-2'>
          <div className='space-y-2'>
            <Label
              htmlFor='create-room-name'
              className={kumpelLabelClass}>
              Channel name
            </Label>
            <Input
              id='create-room-name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={kumpelInputClassName()}
              type='text'
              placeholder='e.g. weekend-plans'
              autoComplete='off'
            />
          </div>
          {error ? (
            <div
              className='rounded-lg border border-kumpel-danger/35 bg-kumpel-danger/10 px-3 py-2 text-sm text-red-200'
              role='alert'>
              {error}
            </div>
          ) : null}
          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              className='border-kumpel-border bg-kumpel-input text-white hover:bg-kumpel-hover hover:text-white'
              onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type='submit'
              variant='kumpel'
              disabled={isLoading}
              className='font-semibold'>
              {isLoading ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
