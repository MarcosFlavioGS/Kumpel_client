import { cn } from '@/lib/utils'

/** Shared Discord-style form controls for auth and modals */
export const kumpelFieldClass =
  'bg-kumpel-input border-kumpel-border text-zinc-100 placeholder:text-kumpel-muted/90 focus-visible:border-kumpel-accent focus-visible:ring-2 focus-visible:ring-kumpel-accent/35 rounded-md transition-[border-color,box-shadow] duration-200'

export const kumpelLabelClass =
  'block text-xs font-semibold uppercase tracking-wider text-kumpel-muted'

export function kumpelInputClassName(opts?: { invalid?: boolean }) {
  return cn(
    kumpelFieldClass,
    opts?.invalid && 'border-kumpel-danger focus-visible:border-kumpel-danger focus-visible:ring-kumpel-danger/35'
  )
}
