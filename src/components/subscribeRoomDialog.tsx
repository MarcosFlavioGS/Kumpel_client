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
import { kumpelInputClassName, kumpelLabelClass } from '@/lib/kumpel-ui'
import { UserPlus } from 'lucide-react'

interface SubscribeRoomDialogProps {
  /** Called after a successful subscribe so the parent can refresh room list (e.g. silent refetch). */
  onSubscribed?: () => void
}

export function SubscribeRoomDialog({ onSubscribed }: SubscribeRoomDialogProps) {
  const [roomName, setRoomName] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const token = useUserStore((state) => state.token)

  const handleSubscribe = async () => {
    if (!roomName.trim() || !code.trim()) {
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
          name: roomName.trim(),
          code: code.trim()
        })
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          typeof data.message === 'string' ? data.message : 'Failed to subscribe to room'
        )
      }

      setOpen(false)
      setRoomName('')
      setCode('')
      onSubscribed?.()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe to room')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          className='h-10 w-full gap-2 border-kumpel-border bg-kumpel-input font-medium text-white hover:bg-kumpel-hover hover:text-white'>
          <UserPlus className='h-4 w-4' />
          Join with code
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[440px] rounded-xl border-kumpel-border bg-kumpel-sidebar text-white shadow-kumpel-glow'>
        <DialogHeader>
          <DialogTitle className='text-lg text-white'>Join a channel</DialogTitle>
          <DialogDescription className='text-kumpel-muted'>
            Enter the exact channel name and access code someone shared with you.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void handleSubscribe()
          }}
          className='grid gap-4 py-2'>
          <div className='space-y-2'>
            <Label
              htmlFor='subscribe-room-name'
              className={kumpelLabelClass}>
              Channel name
            </Label>
            <Input
              id='subscribe-room-name'
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className={kumpelInputClassName()}
              type='text'
              placeholder='Exact name of the channel'
              autoComplete='off'
            />
          </div>
          <div className='space-y-2'>
            <Label
              htmlFor='subscribe-room-code'
              className={kumpelLabelClass}>
              Access code
            </Label>
            <Input
              id='subscribe-room-code'
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={kumpelInputClassName()}
              placeholder='Paste access code'
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
              {isLoading ? 'Joining…' : 'Join channel'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
