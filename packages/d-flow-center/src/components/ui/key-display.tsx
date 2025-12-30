import { Kbd, KbdGroup } from '@/components/ui/kbd.tsx'
import { Space } from 'lucide-react'

interface KeyDisplayProps {
  keys: string[]
  className?: string
}

export function KeyDisplay({ keys, className }: KeyDisplayProps) {
  return (
    <KbdGroup className={className}>
      {keys.map((key, index) => (
        <Kbd key={`${key}-${index}`}>
          {key}
        </Kbd>
      ))}
    </KbdGroup>
  )
}
